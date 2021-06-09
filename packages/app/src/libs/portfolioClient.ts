import dayjs from 'dayjs';
import firebase from 'firebase/app';
import {
  Activity,
  DbActivity,
  DbPortfolio,
  Portfolio,
  TimeSeries,
  activityFromDb,
  activityToDb,
  portfolioFromDb,
  portfolioToDb,
  Snapshot,
  StockInfo,
  DbSnapshotBatch,
  snapshotBatchFromDb,
} from '@tuja/libs';
import type { ParsedLivePrice } from './apiClient';
import { logEvent } from './analytics';

const ACTIVITIES_PAGE_LIMIT = 10;

export interface PortfolioPerformance {
  valueSeries: TimeSeries;
  cashFlowSeries: TimeSeries;
  gainSeries: TimeSeries;
  monthlyDividends: TimeSeries;
  // twrrSeries: TimeSeries;
  portfolio: {
    id: string;
    valueSeries: TimeSeries;
    cashFlowSeries: TimeSeries;
    twrrSeries: TimeSeries;
    gainSeries: TimeSeries;
    monthlyDividends: TimeSeries;
    benchmarkSeries?: TimeSeries;
    totalHoldingsValue: number;
    holdings: {
      [ticker: string]: {
        value: number;
        units: number;
        info: StockInfo;
        livePrice: ParsedLivePrice;
      };
    };
    lastSnapshot?: Snapshot;
  };
}

export interface MaybePortfolioPerformance extends PortfolioPerformance {
  valueSeries: any;
  gainSeries: any;
  cashFlowSeries: any;

  portfolio: PortfolioPerformance['portfolio'] & {
    valueSeries: any;
    gainSeries: any;
    cashFlowSeries: any;
    twrrSeries: any;
    monthlyDividends: any;
    benchmarkSeries?: any;
  };
}

export const createPortfolio = async (
  name: string,
  currency: string,
  uid: string
) => {
  const collectionRef = firebase.firestore().collection(`/portfolios`);
  const docRef = collectionRef.doc();
  await docRef.set(
    portfolioToDb({
      id: docRef.id,
      name,
      user: uid,
      currency,
      aliases: {},
    } as Portfolio)
  );

  return docRef.id;
};

export const watchPortfolios = (
  { uid }: { uid: string },
  onSnap: (data: Portfolio[]) => void
) => {
  const collectionRef = firebase
    .firestore()
    .collection(`/portfolios`)
    .where('user', '==', uid);
  return collectionRef.onSnapshot((collection) => {
    // Analytics
    logEvent('receive_portfolio');
    const docs = collection.docs;
    if (collection.empty || docs.length <= 0) {
      onSnap([]);
      return;
    }
    onSnap(docs.map((doc) => portfolioFromDb(doc.data() as DbPortfolio)));
  });
};

export const updatePortfolioName = (id: string, name: string) => {
  const docRef = firebase.firestore().collection(`/portfolios`).doc(id);
  return docRef.update({ name });
};

export const updateHoldingAlias = (
  id: string,
  ticker: string,
  alias: string
) => {
  const db = firebase.firestore();
  const docRef = db.collection(`/portfolios`).doc(id);
  return db.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    const portfolio = portfolioFromDb(doc.data() as DbPortfolio);

    portfolio.aliases = { ...portfolio.aliases, [ticker]: alias };
    t.set(docRef, portfolioToDb(portfolio));
  });
};

export const updateHoldingAllocation = (
  id: string,
  ticker: string,
  allocation: number
) => {
  const db = firebase.firestore();
  const docRef = db.collection(`/portfolios`).doc(id);
  return db.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    const portfolio = portfolioFromDb(doc.data() as DbPortfolio);

    portfolio.targetAllocations = {
      ...portfolio.targetAllocations,
      [ticker]: allocation,
    };
    t.set(docRef, portfolioToDb(portfolio));
  });
};

export const updatePortfolioBenchmark = (
  id: string,
  benchmarkTicker: string
) => {
  const docRef = firebase.firestore().collection(`/portfolios`).doc(id);
  return docRef.update({
    benchmark: benchmarkTicker || firebase.firestore.FieldValue.delete(),
  });
};

export const getActivities = async (
  portfolioId: string,
  options?: {
    filterType?: Activity['type'];
    fromDoc?: firebase.firestore.QueryDocumentSnapshot<any>;
  }
): Promise<{
  activities: Activity[];
  lastDoc?: firebase.firestore.QueryDocumentSnapshot<any>;
}> => {
  const { filterType, fromDoc } = options ?? {};
  const collectionRef = firebase
    .firestore()
    .collection(`/portfolios/${portfolioId}/activities`);

  // Construct query and fetch from firestore
  let query = collectionRef
    .orderBy('date', 'desc')
    .limit(ACTIVITIES_PAGE_LIMIT);
  if (filterType) {
    query = query.where('type', '==', filterType);
  }
  if (fromDoc) {
    query = query.startAfter(fromDoc);
  }
  const querySnapshot = await query.get();
  if (querySnapshot.empty) return { activities: [] };

  // Parse activity dates
  return {
    activities: querySnapshot.docs.map((doc) =>
      activityFromDb(doc.data() as DbActivity)
    ),
    lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
  };
};

export const addActivity = (portfolioId: string, activity: Activity) => {
  const db = firebase.firestore();
  const collectionRef = db.collection(`/portfolios/${portfolioId}/activities`);
  const docRef = collectionRef.doc();
  return docRef.set(
    activityToDb({
      ...activity,
      id: docRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  );
};

export const deleteActivity = (portfolioId: string, activityId: string) => {
  const db = firebase.firestore();
  const docRef = db.doc(`/portfolios/${portfolioId}/activities/${activityId}`);
  return docRef.delete();
};

export const updateActivity = async (
  portfolioId: string,
  activity: Activity
) => {
  const activityId = activity.id;
  if (!activityId) return;
  const db = firebase.firestore();
  const docRef = db.doc(`/portfolios/${portfolioId}/activities/${activityId}`);
  return docRef.set(activityToDb({ ...activity, updatedAt: new Date() }));
};

export const watchSnapshots = async (
  portfolios: Portfolio[],
  selectedPortfolioId: string,
  startDate: Date,
  onSnap: (snapshots: { [id: string]: Snapshot[] }) => void
) => {
  // Construct query to get snapshots, need to get at least before the
  // startDate's begining of month so that monthly dividends can be calculated
  const db = firebase.firestore();
  const startOfMonth = dayjs(startDate).startOf('month').format('YYYY-MM-DD');
  const getQuery = (id: string) =>
    db
      .collection(`/portfolios/${id}/snapshots`)
      .orderBy('endDate', 'asc')
      .startAt(startOfMonth);

  // Filter out the selected portfolio so we can do a single fetch for the
  // remaining portfolios
  const unselectedPortfolios = portfolios.filter(
    ({ id }) => id !== selectedPortfolioId
  );

  // Do a single fetch to get all the snapshots from unselectedPortfolios
  const snapshotsList = await Promise.all(
    unselectedPortfolios.map(async ({ id }) => {
      const result = await getQuery(id).get();
      return result.docs.flatMap(
        (doc) => snapshotBatchFromDb(doc.data() as DbSnapshotBatch).snapshots
      );
    })
  );

  // Convert the fetched list of snapshots into a map from portfolio ids to the
  // snapshots, if snapshots are empty attempt to use the portfolio's lastSnapshot
  const snapshotsUnselected = snapshotsList.reduce((map, snaps, i) => {
    const portfolio = unselectedPortfolios[i];
    if (!snaps.length && portfolio.latestSnapshot) {
      return { ...map, [portfolio.id]: [portfolio.latestSnapshot] };
    }
    return { ...map, [portfolio.id]: snaps };
  }, {} as { [id: string]: Snapshot[] });

  // Setup watcher for the selected snapshot
  return getQuery(selectedPortfolioId).onSnapshot((snapshot) => {
    const docs = snapshot.docs;
    const portfolio = portfolios.find((p) => p.id === selectedPortfolioId);
    if (!docs.length && portfolio?.latestSnapshot) {
      onSnap({
        ...snapshotsUnselected,
        [selectedPortfolioId]: [portfolio.latestSnapshot],
      });
      return;
    }
    onSnap({
      ...snapshotsUnselected,
      [selectedPortfolioId]: docs.flatMap(
        (doc) => snapshotBatchFromDb(doc.data() as DbSnapshotBatch).snapshots
      ),
    });
  });
};

export function processPerformanceSeries<T>(
  portfolioPerformance: MaybePortfolioPerformance,
  handleTimeSeries: (x: any) => T
) {
  return {
    ...portfolioPerformance,
    valueSeries: handleTimeSeries(portfolioPerformance.valueSeries),
    gainSeries: handleTimeSeries(portfolioPerformance.gainSeries),
    cashFlowSeries: handleTimeSeries(portfolioPerformance.cashFlowSeries),
    portfolio: {
      ...portfolioPerformance.portfolio,
      valueSeries: handleTimeSeries(portfolioPerformance.portfolio.valueSeries),
      gainSeries: handleTimeSeries(portfolioPerformance.portfolio.gainSeries),
      cashFlowSeries: handleTimeSeries(
        portfolioPerformance.portfolio.cashFlowSeries
      ),
      twrrSeries: handleTimeSeries(portfolioPerformance.portfolio.twrrSeries),
      benchmarkSeries:
        portfolioPerformance.portfolio.benchmarkSeries &&
        handleTimeSeries(portfolioPerformance.portfolio.benchmarkSeries),
      monthlyDividends: portfolioPerformance.portfolio.monthlyDividends
        ? handleTimeSeries(portfolioPerformance.portfolio.monthlyDividends)
        : handleTimeSeries({ data: [] }),
    },
  };
}

export const examplePortfolio: Portfolio = {
  id: 'example-portfolio',
  user: 'demo',
  name: 'Example Portfolio',
  currency: 'GBP',
  aliases: {
    'AAPL.US': 'Apple',
    'SGLN.LSE': 'Gold ETC',
    'VUSA.LSE': 'S&P 500 ETF',
  },
  latestSnapshot: {
    date: new Date('2020-08-31'),
    cash: 97.8,
    cashFlow: 5000,
    numShares: {
      'AAPL.US': 40,
      'SGLN.LSE': 50,
      'VUSA.LSE': 50,
    },
    dividend: 0,
  },
  costBasis: {
    'AAPL.US': 39.6925,
    'SGLN.LSE': 21.55,
    'VUSA.LSE': 44.74,
  },
  activitiesStartDate: new Date('2019-07-01'),
  benchmark: 'GSPC.INDX',
};

export const exampleActivities = [
  { id: '1', date: new Date('2019-07-01'), type: 'Deposit', amount: 5000 },
  {
    id: '2',
    date: new Date('2019-07-01'),
    type: 'Trade',
    trades: [{ ticker: 'AAPL.US', units: 10 }],
    cost: 1587.7,
  },
  {
    id: '3',
    date: new Date('2019-07-01'),
    type: 'Trade',
    trades: [{ ticker: 'SGLN.LSE', units: 50 }],
    cost: 1077.5,
  },
  {
    id: '4',
    date: new Date('2019-07-01'),
    type: 'Trade',
    trades: [{ ticker: 'VUSA.LSE', units: 50 }],
    cost: 2237,
  },
  {
    id: '5',
    date: new Date('2020-08-31'),
    type: 'StockDividend',
    ticker: 'AAPL.US',
    units: 30,
  },
];

export const exampleSnapshots: Snapshot[] = [
  {
    date: new Date('2019-07-01'),
    cash: 97.8,
    cashFlow: 5000,
    dividend: 0,
    numShares: {
      'AAPL.US': 10,
      'SGLN.LSE': 50,
      'VUSA.LSE': 50,
    },
  },
  {
    date: new Date('2020-08-31'),
    cash: 97.8,
    cashFlow: 5000,
    dividend: 0,
    numShares: {
      'AAPL.US': 40,
      'SGLN.LSE': 50,
      'VUSA.LSE': 50,
    },
  },
];
