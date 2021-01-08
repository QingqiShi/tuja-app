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
  StockLivePrice,
  DbSnapshotBatch,
  snapshotBatchFromDb,
} from '@tuja/libs';

const ACTIVITIES_PAGE_LIMIT = 10;

export interface PortfolioPerformance {
  id: string;
  valueSeries: TimeSeries;
  twrrSeries: TimeSeries;
  gainSeries: TimeSeries;
  cashFlowSeries: TimeSeries;
  benchmarkSeries?: TimeSeries;
  lastSnapshot?: Snapshot;
  totalHoldingsValue: number;
  holdings: {
    [ticker: string]: {
      value: number;
      units: number;
      info: StockInfo;
      livePrice: StockLivePrice;
    };
  };
  monthlyDividends: TimeSeries;
}

export interface MaybePortfolioPerformance extends PortfolioPerformance {
  valueSeries: any;
  twrrSeries: any;
  gainSeries: any;
  cashFlowSeries: any;
  monthlyDividends: any;
  benchmarkSeries?: any;
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
    console.log('received portfolio update');
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

export const watchSnapshots = (
  portfolioId: string,
  startDate: Date,
  onSnap: (snapshots: Snapshot[]) => void
) => {
  // Get the start of the calendar month of the startDate
  const startOfMonth = dayjs(startDate).startOf('month');
  const query = firebase
    .firestore()
    .collection(`/portfolios/${portfolioId}/snapshots`)
    .orderBy('endDate', 'asc')
    .startAt(startOfMonth.format('YYYY-MM-DD'));
  return query.onSnapshot((snapshot) => {
    console.log('received snapshots update');
    const docs = snapshot.docs;
    if (snapshot.empty || docs.length <= 0) {
      onSnap([]);
      return;
    }
    onSnap(
      docs.flatMap(
        (doc) => snapshotBatchFromDb(doc.data() as DbSnapshotBatch).snapshots
      )
    );
  });
};

export function processPerformanceSeries<T>(
  portfolioPerformance: MaybePortfolioPerformance,
  handleTimeSeries: (x: any) => T
) {
  return {
    ...portfolioPerformance,
    valueSeries: handleTimeSeries(portfolioPerformance.valueSeries),
    twrrSeries: handleTimeSeries(portfolioPerformance.twrrSeries),
    gainSeries: handleTimeSeries(portfolioPerformance.gainSeries),
    cashFlowSeries: handleTimeSeries(portfolioPerformance.cashFlowSeries),
    benchmarkSeries:
      portfolioPerformance.benchmarkSeries &&
      handleTimeSeries(portfolioPerformance.benchmarkSeries),
    monthlyDividends: portfolioPerformance.monthlyDividends
      ? handleTimeSeries(portfolioPerformance.monthlyDividends)
      : handleTimeSeries({ data: [] }),
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
  activities: [],
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
