import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';

const DATE_FORMAT = 'YYYY-MM-DD';
const DEFAULT_BATCH_SIZE = 20;

export type DistributedOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

interface BaseActivity {
  id?: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DepositActivity extends BaseActivity {
  type: 'Deposit';
  amount: number;
}

interface TradeActivity extends BaseActivity {
  type: 'Trade';
  trades: { ticker: string; units: number }[];
  cost: number;
}

interface DividendActivity extends BaseActivity {
  type: 'Dividend';
  ticker: string;
  amount: number;
}

interface StockDividendActivity extends BaseActivity {
  type: 'StockDividend';
  ticker: string;
  units: number;
}

/**
 * The data type used internally for tracking activities
 */
export type Activity =
  | DepositActivity
  | TradeActivity
  | DividendActivity
  | StockDividendActivity;

/**
 * The data type stored into the database, the difference between this one and
 * the normal Activity type is that date is formated as 'YYYY-MM-DD', and there's
 * an additional flag `shouldTrigger` that can be used to disable Firestore
 * triggerred Cloud Function from running.
 */
export type DbActivity = DistributedOmit<
  Activity,
  'date' | 'createdAt' | 'updatedAt'
> & {
  date: string;
  skipTrigger?: boolean;
  createdAt?: number;
  updatedAt?: number;
};

export const activityToDb = (
  activity: Activity,
  skipTrigger = false
): DbActivity => ({
  ...activity,
  date: dayjs(activity.date).format(DATE_FORMAT),
  skipTrigger,
  createdAt: activity.createdAt?.getTime(),
  updatedAt: activity.updatedAt?.getTime(),
});

export const activityFromDb = (dbActivity: DbActivity): Activity => ({
  ...dbActivity,
  date: dayjs(dbActivity.date, DATE_FORMAT).toDate(),
  createdAt: dbActivity.createdAt ? new Date(dbActivity.createdAt) : undefined,
  updatedAt: dbActivity.updatedAt ? new Date(dbActivity.updatedAt) : undefined,
});

/**
 * The data type used internally to capture a daily snapshot of the portfolio
 * for a given day.
 */
export interface Snapshot {
  date: Date;
  cashFlow: number;
  cash: number;
  dividend: number;
  numShares: { [ticker: string]: number };
}

export type DbSnapshot = Omit<Snapshot, 'date'> & { date: string };

export const snapshotToDb = (snapshot: Snapshot): DbSnapshot => ({
  ...snapshot,
  date: dayjs(snapshot.date).format(DATE_FORMAT),
});

export const snapshotFromDb = (dbSnapshot: DbSnapshot): Snapshot => ({
  ...dbSnapshot,
  date: dayjs(dbSnapshot.date, DATE_FORMAT).toDate(),
});

/**
 * Snapshots are split into batches to optimise databse reads.
 */
export type SnapshotBatch = {
  startDate: Date;
  endDate: Date;
  snapshots: Snapshot[];
};

export type DbSnapshotBatch = {
  startDate: string;
  endDate: string;
  snapshots: DbSnapshot[];
};

export const snapshotBatchToDb = (
  snapshotBatch: SnapshotBatch
): DbSnapshotBatch => ({
  startDate: dayjs(snapshotBatch.startDate).format(DATE_FORMAT),
  endDate: dayjs(snapshotBatch.endDate).format(DATE_FORMAT),
  snapshots: snapshotBatch.snapshots.map(snapshotToDb),
});

export const snapshotBatchFromDb = (
  dbSnapshotBatch: DbSnapshotBatch
): SnapshotBatch => ({
  startDate: dayjs(dbSnapshotBatch.startDate, DATE_FORMAT).toDate(),
  endDate: dayjs(dbSnapshotBatch.endDate, DATE_FORMAT).toDate(),
  snapshots: dbSnapshotBatch.snapshots.map(snapshotFromDb),
});

/**
 * Use an activity to update an existing snapshot, then return the new snapshot.
 */
export const updateSnapshot = (
  activity: Activity,
  prevSnapshot: Snapshot
): Snapshot => {
  const isSameDay = dayjs(activity.date).isSame(prevSnapshot.date, 'day');
  if (activity.type === 'Deposit') {
    return {
      ...prevSnapshot,
      date: activity.date,
      cashFlow: new BigNumber(prevSnapshot.cashFlow)
        .plus(activity.amount)
        .toNumber(),
      cash: new BigNumber(prevSnapshot.cash).plus(activity.amount).toNumber(),
      dividend: isSameDay ? prevSnapshot.dividend : 0,
    };
  }
  if (activity.type === 'Dividend') {
    return {
      ...prevSnapshot,
      date: activity.date,
      cash: new BigNumber(prevSnapshot.cash).plus(activity.amount).toNumber(),
      dividend: isSameDay
        ? prevSnapshot.dividend + activity.amount
        : activity.amount,
    };
  }
  if (activity.type === 'StockDividend') {
    const newSnapshot = {
      ...prevSnapshot,
      date: activity.date,
      numShares: { ...prevSnapshot.numShares },
      dividend: isSameDay ? prevSnapshot.dividend : 0,
    };
    if (activity.units) {
      newSnapshot.numShares[activity.ticker] = new BigNumber(
        newSnapshot.numShares[activity.ticker] ?? 0
      )
        .plus(activity.units)
        .toNumber();
    }
    return newSnapshot;
  }
  if (activity.type === 'Trade') {
    const newSnapshot = {
      ...prevSnapshot,
      date: activity.date,
      cash: new BigNumber(prevSnapshot.cash).minus(activity.cost).toNumber(),
      dividend: isSameDay ? prevSnapshot.dividend : 0,
      numShares: { ...prevSnapshot.numShares },
    };
    activity.trades.forEach((trade) => {
      if (trade.units) {
        newSnapshot.numShares[trade.ticker] = new BigNumber(
          newSnapshot.numShares[trade.ticker] ?? 0
        )
          .plus(trade.units)
          .toNumber();
      }
    });
    return newSnapshot;
  }
  return prevSnapshot;
};

/**
 * Splits snapshots into batches so they can be stored into the db
 */
export const batchSnapshots = (
  snapshots: Snapshot[],
  batchSize = DEFAULT_BATCH_SIZE
): SnapshotBatch[] => {
  const batches: SnapshotBatch[] = [];
  const toBeBatched = [...snapshots];
  while (toBeBatched.length) {
    const batch = toBeBatched.splice(0, batchSize);
    batches.push({
      startDate: batch[0].date,
      endDate: batch[batch.length - 1].date,
      snapshots: batch,
    });
  }
  return batches;
};

/**
 * The shared props for activity forms
 */
export interface ActivityFormProps {
  currency: string;
  initialActivity?: Activity;
  onClose?: () => void;
  onSubmit?: (activity: Activity) => Promise<void>;
  onDelete?: () => Promise<void>;
}

/**
 * Function for generating activity labels
 */
export const activityLabels = (activity: Activity) => {
  if (activity.type === 'Trade') {
    return activity.cost >= 0 ? 'Buy' : 'Sell';
  }
  if (activity.type === 'Dividend') {
    return 'Cash Dividend';
  }
  if (activity.type === 'StockDividend') {
    return 'Stock Dividend';
  }
  return activity.type;
};
