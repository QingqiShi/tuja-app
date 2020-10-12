import dayjs from 'dayjs';
import { bisector } from 'd3-array';
import { firestore } from 'firebase/app';
import TimeSeries from './timeSeries';
import {
  StocksData,
  StockInfo,
  exchangeCurrency,
  StockLivePrice,
} from './stocksClient';
import { Activity } from './activities';

const PORTFOLIO_DATE_FORMAT = 'YYYY-MM-DD';

interface History {
  date: Date;
  cash: number;
  deposit: number;
  dividend: number;
  holdings: { [ticker: string]: number };
  avgPrices: { [ticker: string]: number };
}

export interface Portfolio {
  id: string;
  name: string;
  currency: string;
  tickers: string[];
  activities: Activity[];
  aliases: { [ticker: string]: string };
  user: string;
  targetAllocations?: { [ticker: string]: number };
}

export interface PortfolioPerformance {
  id: string;
  value: number;
  gain: number;
  roi: number;
  remainingCash: number;
  dividendReceived: number;
  totalDeposit: number;
  holdings: {
    [ticker: string]: {
      info?: StockInfo;
      livePrice?: StockLivePrice;
      quantity: number;
      value: number;
      gain: number;
      roi: number;
      dayChange: number;
      dayChangePercentage: number;
    };
  };
  series: {
    valueSeries: TimeSeries;
    deposits: TimeSeries;
    gains: TimeSeries;
    returns: TimeSeries;
  };
}

const bisectDate = bisector<{ date: Date }, Date>((d, x) => {
  const current = dayjs(d.date);
  if (current.isBefore(x, 'date')) return -1;
  if (current.isSame(x, 'date')) return 0;
  return 1;
}).right;

const fixQuantity = (quantity: number) =>
  Math.round(quantity * 100000000) / 100000000;

function getHistoryPoint(history: History[], date: Date) {
  if (!history.length) return null;
  const index = bisectDate(history, date) - 1;
  if (
    index >= history.length ||
    dayjs(date).isSame(history[history.length - 1].date, 'date')
  ) {
    return history[history.length - 1];
  } else if (index >= 0 && index < history.length) {
    return history[index];
  }
  return history[0];
}

function getHoldingsValue(
  holdings: History['holdings'],
  date: Date,
  currency: string,
  stocksData: StocksData
) {
  return Object.keys(holdings).reduce((value, ticker) => {
    const stock = stocksData[ticker];
    if (!stock) return value;

    const price = exchangeCurrency(
      stock.closeSeries?.get(date) ?? 0,
      stock.info?.Currency ?? currency,
      currency,
      date,
      stocksData
    );

    return value + price * holdings[ticker];
  }, 0);
}

export function aggregateActivities(
  activities: Activity[],
  stocksData: StocksData,
  baseCurrency: string
) {
  const aggregated: History[] = [];
  activities.forEach((activity) => {
    const currentAggregate = aggregated[aggregated.length - 1]
      ? {
          ...aggregated[aggregated.length - 1],
          holdings: { ...aggregated[aggregated.length - 1].holdings },
          avgPrices: { ...aggregated[aggregated.length - 1].avgPrices },
          date: activity.date,
        }
      : {
          date: activity.date,
          cash: 0,
          deposit: 0,
          dividend: 0,
          holdings: {},
          avgPrices: {},
        };
    switch (activity.type) {
      case 'Deposit':
        currentAggregate.deposit += activity.amount;
        currentAggregate.cash += activity.amount;
        break;
      case 'Dividend':
        currentAggregate.dividend += activity.amount;
        currentAggregate.cash += activity.amount;
        break;
      case 'StockDividend':
        const previousUnits = currentAggregate.holdings[activity.ticker] ?? 0;
        const newUnits = previousUnits + activity.units;
        currentAggregate.holdings[activity.ticker] = newUnits;

        if (newUnits > 0) {
          const previousAvgPrice =
            currentAggregate.avgPrices[activity.ticker] ?? 0;
          currentAggregate.avgPrices[activity.ticker] =
            (previousUnits * previousAvgPrice) / newUnits;
        } else {
          currentAggregate.avgPrices[activity.ticker] = 0;
        }
        break;
      case 'Trade':
        currentAggregate.cash -= activity.cost;
        activity.trades.forEach((trade) => {
          const previousUnits = currentAggregate.holdings[trade.ticker] ?? 0;
          currentAggregate.holdings[trade.ticker] = previousUnits + trade.units;

          if (trade.units > 0) {
            const previousAvgPrice =
              currentAggregate.avgPrices[trade.ticker] ?? 0;
            const currentPrice = exchangeCurrency(
              stocksData[trade.ticker].closeSeries?.get(activity.date) ?? 0,
              stocksData[trade.ticker].info?.Currency ?? baseCurrency,
              baseCurrency,
              activity.date,
              stocksData
            );
            currentAggregate.avgPrices[trade.ticker] =
              (previousUnits * previousAvgPrice + trade.units * currentPrice) /
              (previousUnits + trade.units);
          }
        });
        break;
    }

    if (!aggregated.length) {
      aggregated.push(currentAggregate);
    } else if (
      dayjs(aggregated[aggregated.length - 1].date).isSame(
        activity.date,
        'date'
      )
    ) {
      aggregated[aggregated.length - 1] = currentAggregate;
    } else {
      aggregated.push(currentAggregate);
    }
  });
  return aggregated;
}

export function getPortfolioPerformance(
  portfolio: Portfolio,
  startDate: Date,
  endDate: Date,
  stocksData: StocksData
): PortfolioPerformance | null {
  const { activities, currency } = portfolio;

  if (!activities.length) return null;

  const history = aggregateActivities(
    portfolio.activities,
    stocksData,
    currency
  );
  const initial = getHistoryPoint(history, startDate) ?? {
    date: startDate,
    cash: 0,
    deposit: 0,
    dividend: 0,
    holdings: {},
  };

  const valueSeries = new TimeSeries();
  const deposits = new TimeSeries();
  const gains = new TimeSeries();
  const returns = new TimeSeries();

  // Date loop
  for (
    let day = dayjs(startDate);
    day.isSameOrBefore(endDate, 'date');
    day = day.add(1, 'day')
  ) {
    // Only look at week days
    if (day.day() <= 0 || day.day() >= 6) continue;
    const current = day.toDate();

    // Get closest point in history
    const historyPoint = getHistoryPoint(history, current);
    if (!historyPoint) continue;
    const { holdings, cash, deposit } = historyPoint;

    // Portfolio value
    const holdingsValue = getHoldingsValue(
      holdings,
      current,
      currency,
      stocksData
    );
    const portfolioValue = holdingsValue + cash;
    valueSeries.data.push([current, portfolioValue]);

    // Portfolio deposits
    deposits.data.push([current, deposit]);

    // Portfolio gains
    gains.data.push([
      current,
      valueSeries.get(current) -
        valueSeries.get(startDate) -
        (deposit - initial.deposit),
    ]);

    // Portfolio returns
    returns.data.push([
      current,
      gains.get(current) /
        (valueSeries.get(startDate) + (deposit - initial.deposit)),
    ]);
  }

  const lastHistory = history[history.length - 1];

  const holdings: PortfolioPerformance['holdings'] = {};
  Object.keys(lastHistory.holdings).forEach((ticker) => {
    const info = stocksData[ticker]?.info;
    const livePrice = stocksData[ticker]?.livePrice;
    const quantity = fixQuantity(lastHistory.holdings[ticker]);
    const value =
      exchangeCurrency(
        livePrice?.close ?? 0,
        info?.Currency ?? currency,
        currency,
        endDate,
        stocksData
      ) * quantity;
    const dayChange = (livePrice?.close ?? 0) - (livePrice?.previousClose ?? 0);
    const cost = (lastHistory.avgPrices[ticker] ?? 0) * quantity;
    const gain = value - cost;

    holdings[ticker] = {
      info,
      livePrice,
      quantity,
      value,
      gain,
      roi: gain / cost,
      dayChange,
      dayChangePercentage: livePrice?.previousClose
        ? dayChange / livePrice.previousClose
        : 0,
    };
  });

  return {
    id: portfolio.id,
    value: valueSeries.data[valueSeries.data.length - 1]?.[1] ?? 0,
    gain: gains.data[gains.data.length - 1]?.[1] ?? 0,
    roi: returns.data[returns.data.length - 1]?.[1] ?? 0,
    remainingCash: lastHistory.cash,
    dividendReceived: lastHistory.dividend,
    totalDeposit: lastHistory.deposit,
    holdings,
    series: { valueSeries, deposits, gains, returns },
  };
}

export function createPortfolio(name: string, currency: string, uid: string) {
  const collectionRef = firestore().collection(`/portfolios`);
  const docRef = collectionRef.doc();
  return docRef.set({
    id: docRef.id,
    user: uid,
    name,
    currency,
    tickers: [],
    aliases: {},
    activities: [],
  } as Portfolio);
}

export function watchPortfolio(
  { uid }: { uid: string },
  onSnap: (data: Portfolio[]) => void
) {
  const collectionRef = firestore()
    .collection(`/portfolios`)
    .where('user', '==', uid);
  return collectionRef.onSnapshot((collection) => {
    const docs = collection.docs;
    if (collection.empty || docs.length <= 0) {
      onSnap([]);
      return;
    }
    onSnap(docs.map((doc) => dbToPortfolio(doc.data())));
  });
}

export function updatePortfolioName(id: string, name: string) {
  const docRef = firestore().collection(`/portfolios`).doc(id);
  return docRef.update({ name });
}

export function addPortfolioActivity(id: string, activity: Activity) {
  const db = firestore();
  const docRef = db.collection(`/portfolios`).doc(id);
  return db.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    const portfolio = dbToPortfolio(doc.data());
    t.update(
      docRef,
      portfolioToDb({
        ...portfolio,
        activities: [...portfolio.activities, activity],
      })
    );
  });
}

export function updatePortfolioActivities(id: string, activities: Activity[]) {
  const db = firestore();
  const docRef = db.collection(`/portfolios`).doc(id);
  return db.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    const portfolio = dbToPortfolio(doc.data());
    t.update(
      docRef,
      portfolioToDb({
        ...portfolio,
        activities,
      })
    );
  });
}

export function updateHoldingAlias(id: string, ticker: string, alias: string) {
  const db = firestore();
  const docRef = db.collection(`/portfolios`).doc(id);
  return db.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    const portfolio = dbToPortfolio(doc.data());

    portfolio.aliases = { ...portfolio.aliases, [ticker]: alias };
    t.update(docRef, portfolioToDb(portfolio));
  });
}

export function updateHoldingAllocation(
  id: string,
  ticker: string,
  allocation: number
) {
  const db = firestore();
  const docRef = db.collection(`/portfolios`).doc(id);
  return db.runTransaction(async (t) => {
    const doc = await t.get(docRef);
    const portfolio = dbToPortfolio(doc.data());

    portfolio.targetAllocations = {
      ...portfolio.targetAllocations,
      [ticker]: allocation,
    };
    t.update(docRef, portfolioToDb(portfolio));
  });
}

function dbToPortfolio(data: any): Portfolio {
  return {
    ...data,
    activities: ((data.activities ?? []) as any[])
      .map(
        (snapshot) =>
          ({
            ...snapshot,
            date: dayjs(snapshot.date, PORTFOLIO_DATE_FORMAT).toDate(),
          } as Activity)
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime()),
  };
}

function portfolioToDb(data: Portfolio): any {
  return {
    ...data,
    activities: data.activities
      .map((activity) => ({
        ...activity,
        date: dayjs(activity.date).format(PORTFOLIO_DATE_FORMAT),
      }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
    tickers: Array.from(
      data.activities.reduce((tickers, activity) => {
        if (activity.type === 'Trade') {
          activity.trades
            .map(({ ticker }) => ticker)
            .forEach((ticker) => tickers.add(ticker));
        }
        return tickers;
      }, new Set<string>())
    ),
  };
}

export const examplePortfolio: Portfolio = {
  id: 'example-portfolio',
  user: 'demo',
  name: 'Example Portfolio',
  currency: 'GBP',
  tickers: ['AAPL.US', 'SGLN.LSE', 'VUSA.LSE'],
  aliases: {
    'AAPL.US': 'Apple',
    'SGLN.LSE': 'Gold ETC',
    'VUSA.LSE': 'S&P 500 ETF',
  },
  activities: [
    { date: new Date('2019-07-01'), type: 'Deposit', amount: 5000 },
    {
      date: new Date('2019-07-01'),
      type: 'Trade',
      trades: [{ ticker: 'AAPL.US', units: 10 }],
      cost: 1587.7,
    },
    {
      date: new Date('2019-07-01'),
      type: 'Trade',
      trades: [{ ticker: 'SGLN.LSE', units: 50 }],
      cost: 1077.5,
    },
    {
      date: new Date('2019-07-01'),
      type: 'Trade',
      trades: [{ ticker: 'VUSA.LSE', units: 50 }],
      cost: 22.37,
    },
    {
      date: new Date('2020-08-31'),
      type: 'StockDividend',
      ticker: 'AAPL.US',
      units: 30,
    },
  ],
};
