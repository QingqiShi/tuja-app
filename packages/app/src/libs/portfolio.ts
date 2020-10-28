import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid';
import firebase from 'firebase/app';
import TimeSeries from './timeSeries';
import { Activity } from './activities';

const PORTFOLIO_DATE_FORMAT = 'YYYY-MM-DD';

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
  valueSeries: TimeSeries;
  twrrSeries: TimeSeries;
  gainSeries: TimeSeries;
  cashFlowSeries: TimeSeries;
  cash: number;
  totalHoldingsValue: number;
  holdings: {
    [ticker: string]: {
      value: number;
      gain: number;
      units: number;
      returns: number;
    };
  };
}

export function createPortfolio(name: string, currency: string, uid: string) {
  const collectionRef = firebase.firestore().collection(`/portfolios`);
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
  const collectionRef = firebase
    .firestore()
    .collection(`/portfolios`)
    .where('user', '==', uid);
  return collectionRef.onSnapshot((collection) => {
    const docs = collection.docs;
    if (collection.empty || docs.length <= 0) {
      onSnap([]);
      return;
    }
    const portfolios = docs
      .map((doc) => dbToPortfolio(doc.data()))
      .map((portfolio) => ({
        ...portfolio,
        activities: portfolio.activities.map((activity) =>
          activity.id ? activity : { ...activity, id: uuid() }
        ),
      }));
    onSnap(portfolios);
  });
}

export function updatePortfolioName(id: string, name: string) {
  const docRef = firebase.firestore().collection(`/portfolios`).doc(id);
  return docRef.update({ name });
}

export function addPortfolioActivity(id: string, activity: Activity) {
  const db = firebase.firestore();
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
  const db = firebase.firestore();
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
  const db = firebase.firestore();
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
  const db = firebase.firestore();
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
  ],
};
