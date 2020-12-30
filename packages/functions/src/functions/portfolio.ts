import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import type { Activity, DbActivity, DbPortfolio, Snapshot } from '@tuja/libs';
import { _getStocksPrices, _getStockInfo } from './stocksData';

interface CostBasis {
  [ticker: string]: number;
}

const EMPTY_SNAPSHOT: Snapshot = {
  date: new Date(),
  cash: 0,
  cashFlow: 0,
  numShares: {},
};

/**
 * Get the price at a particular date, then exchange it to the base currency.
 */
async function _getPricesInCurrency(
  tickers: string[],
  currency: string,
  date: Date
) {
  const { exchangeCurrency } = await import('@tuja/libs');
  const infos = await Promise.all(tickers.map(_getStockInfo));
  const prices = await _getStocksPrices(tickers, date, currency);

  return tickers.map((ticker, i) => {
    const tickerCurrency = infos[i].Currency;
    return exchangeCurrency(
      prices[ticker],
      tickerCurrency,
      currency,
      (forexPair) => prices[forexPair]
    );
  });
}

/**
 * Calculate cost basis for investment holdings.
 */
async function _updateCosts(
  costPerShare: CostBasis,
  prevSnapshot: Snapshot,
  currency: string,
  afterActivity?: Activity,
  beforeActivity?: Activity
) {
  const { default: BigNumber } = await import('bignumber.js');

  if (
    (!afterActivity || afterActivity?.type === 'StockDividend') &&
    (!beforeActivity || beforeActivity?.type === 'StockDividend')
  ) {
    const ticker = afterActivity?.ticker || beforeActivity?.ticker;
    if (!ticker) return costPerShare;

    const currentCost = costPerShare[ticker] ?? 0;
    const currentHolding = prevSnapshot.numShares[ticker] ?? 0;
    const afterUnits = afterActivity?.units ?? 0;
    const beforeUnits = beforeActivity?.units ?? 0;

    const newNumShare = new BigNumber(currentHolding)
      .plus(afterUnits)
      .minus(beforeUnits)
      .toNumber();

    if (newNumShare === 0) {
      return { ...costPerShare, [ticker]: 0 };
    }
    return {
      ...costPerShare,
      [ticker]: new BigNumber(currentCost)
        .multipliedBy(currentHolding)
        .dividedBy(newNumShare)
        .toNumber(),
    };
  }
  if (
    (!afterActivity || afterActivity?.type === 'Trade') &&
    (!beforeActivity || beforeActivity?.type === 'Trade')
  ) {
    const newCost = { ...costPerShare };

    if (beforeActivity) {
      const prices =
        beforeActivity.trades.length > 1
          ? await _getPricesInCurrency(
              beforeActivity.trades.map((trade) => trade.ticker),
              currency,
              beforeActivity.date
            )
          : null;
      beforeActivity.trades.forEach((trade, i) => {
        const tradeValue = prices
          ? new BigNumber(prices[i]).multipliedBy(trade.units).toNumber()
          : beforeActivity.cost;
        const currentCost = newCost[trade.ticker] ?? 0;
        const currentHolding = prevSnapshot.numShares[trade.ticker] ?? 0;
        const newNumShare = new BigNumber(currentHolding)
          .minus(trade.units)
          .toNumber();

        if (newNumShare === 0) {
          newCost[trade.ticker] = 0;
        } else {
          newCost[trade.ticker] = new BigNumber(currentCost)
            .multipliedBy(currentHolding)
            .minus(tradeValue)
            .dividedBy(newNumShare)
            .toNumber();
        }
      });
    }

    if (afterActivity) {
      const prices =
        afterActivity.trades.length > 1
          ? await _getPricesInCurrency(
              afterActivity.trades.map((trade) => trade.ticker),
              currency,
              afterActivity.date
            )
          : null;
      afterActivity.trades.forEach((trade, i) => {
        const tradeValue = prices
          ? new BigNumber(prices[i]).multipliedBy(trade.units).toNumber()
          : afterActivity.cost;
        const cost = newCost[trade.ticker] ?? 0;
        const numShare =
          (prevSnapshot.numShares[trade.ticker] ?? 0) -
          (beforeActivity?.trades.find(({ ticker }) => ticker === trade.ticker)
            ?.units ?? 0);
        const newNumShare = new BigNumber(numShare)
          .plus(trade.units)
          .toNumber();

        if (newNumShare === 0) {
          newCost[trade.ticker] = 0;
        } else {
          newCost[trade.ticker] = new BigNumber(cost)
            .multipliedBy(numShare)
            .plus(tradeValue)
            .dividedBy(newNumShare)
            .toNumber();
        }
      });
    }

    return newCost;
  }
  return costPerShare;
}

/**
 * Migrate all portfolios from old structure to new one where activites are
 * split out into seperate documents.
 *
 * Unused because the migration is done.
 */
export const migrateActivities = functions
  .runWith({ memory: '1GB' })
  .https.onRequest(async (_req, res) => {
    const db = admin.firestore();
    const portfoliosRef = await db.collection('portfolios').listDocuments();

    const {
      activityFromDb,
      activityToDb,
      updateSnapshot,
      snapshotToDb,
    } = await import('@tuja/libs');

    await Promise.all(
      portfoliosRef.map(async (portfolioRef) => {
        const activitiesCollection = db.collection(
          `portfolios/${portfolioRef.id}/activities`
        );

        // Clear existing activities
        const activityDocs = await activitiesCollection.listDocuments();
        await Promise.all(
          activityDocs.map((activityDoc) => activityDoc.delete())
        );

        await db.runTransaction(async (t) => {
          // Fetch portfolio data to get old activities
          const portfolio = (await t.get(portfolioRef)).data() as
            | DbPortfolio
            | undefined;
          const activities = portfolio?.activities?.map(activityFromDb);
          const currency = portfolio?.currency;

          if (!portfolio || !activities?.length || !currency) return;

          let snapshot: Snapshot = EMPTY_SNAPSHOT;
          let costBasis: CostBasis = {};

          for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];

            // Update cost basis, leave out last one for trigger function
            if (i < activities.length - 1) {
              costBasis = await _updateCosts(
                costBasis,
                snapshot,
                currency,
                activity
              );
              snapshot = updateSnapshot(activity, snapshot);
            }

            // Create activity document
            const doc = activitiesCollection.doc();
            t.set(doc, {
              ...activityToDb(activity),
              id: doc.id,
              skipTrigger: i !== activities.length - 1,
            } as DbActivity);
          }

          // Set cost basis for portfolio
          t.set(portfolioRef, {
            ...portfolio,
            costBasis,
            latestSnapshot: snapshotToDb(snapshot),
          } as DbPortfolio);
        });
      })
    );

    res.send('Done');
  });

export const aggregateActivities = functions
  .runWith({ memory: '1GB' })
  .firestore.document('portfolios/{portfolioId}/activities/{activityId}')
  .onWrite(async (snap, context) => {
    const afterActivity = snap.after.data() as DbActivity | undefined;
    const beforeActivity = snap.before.data() as DbActivity | undefined;

    // Skip based on skipTrigger flag, useful for bulk activity actions
    if (afterActivity && !!afterActivity?.skipTrigger) return;

    functions.logger.log('triggered accumulate activities');

    // Lazy imports
    const { default: dayjs } = await import('dayjs');
    const {
      activityFromDb,
      batchSnapshots,
      snapshotBatchToDb,
      updateSnapshot,
      portfolioFromDb,
      portfolioToDb,
    } = await import('@tuja/libs');

    const { portfolioId } = context.params;
    const db = admin.firestore();

    const portfolioDocRef = db.doc(`portfolios/${portfolioId}`);
    const activitiesQuery = db
      .collection(`portfolios/${portfolioId}/activities`)
      .orderBy('date', 'asc');
    const snapshotsCollection = db.collection(
      `portfolios/${portfolioId}/snapshots`
    );

    await db.runTransaction(async (t) => {
      // Get portfolio
      const portfolioDoc = await portfolioDocRef.get();
      const portfolio = portfolioFromDb(portfolioDoc.data() as DbPortfolio);
      if (!portfolio) return;

      // Get activities
      const activityDocs = await t.get(activitiesQuery);
      const activities = activityDocs.docs.map((doc) =>
        activityFromDb(doc.data() as DbActivity)
      );

      // Calculate accumulation data and assign to snapshots
      const snapshots: Snapshot[] = [];
      const currency = portfolio.currency;
      for (const activity of activities) {
        const prev = snapshots[snapshots.length - 1] ?? EMPTY_SNAPSHOT;

        // New snapshot
        const newSnapshot = updateSnapshot(activity, prev);

        if (
          snapshots.length &&
          dayjs(snapshots[snapshots.length - 1].date).isSame(
            activity.date,
            'day'
          )
        ) {
          // Same day, replace previous snapshot
          snapshots[snapshots.length - 1] = newSnapshot;
        } else {
          // New day, push snapshot
          snapshots.push(newSnapshot);
        }
      }

      const snapshotBatches = batchSnapshots(snapshots);

      // Clear existing snapshots
      const snapshotDocs = await snapshotsCollection.listDocuments();
      snapshotDocs.forEach((activityDoc) => t.delete(activityDoc));

      // Store new batches
      snapshotBatches.forEach((batch) => {
        const doc = snapshotsCollection.doc();
        t.set(doc, snapshotBatchToDb(batch));
      });

      // Calculate latest costbasis
      const currentCostBasis = portfolio.costBasis ?? {};
      const prevSnapshot = portfolio.latestSnapshot;
      const costBasis =
        prevSnapshot &&
        (await _updateCosts(
          currentCostBasis,
          prevSnapshot,
          currency,
          afterActivity && activityFromDb(afterActivity),
          beforeActivity && activityFromDb(beforeActivity)
        ));

      // Update portfolio
      const activitiesStartDate = snapshots.length
        ? snapshots[0].date
        : undefined;

      t.set(
        portfolioDocRef,
        portfolioToDb({
          ...portfolio,
          costBasis,
          activitiesStartDate,
          latestSnapshot: snapshots[snapshots.length - 1],
        })
      );
    });
  });
