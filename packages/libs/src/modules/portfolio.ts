import dayjs from 'dayjs';
import {
  snapshotFromDb,
  snapshotToDb,
  DbSnapshot,
  Snapshot,
} from './activities';

const DATE_FORMAT = 'YYYY-MM-DD';

/**
 * The data type used internally for tracking portfolio
 */
export interface Portfolio {
  id: string;
  name: string;
  user: string;
  currency: string;
  aliases: { [ticker: string]: string };
  targetAllocations?: { [ticker: string]: number };
  costBasis?: { [ticker: string]: number };
  activitiesStartDate?: Date;
  benchmark?: string;
  latestSnapshot?: Snapshot;
}

/**
 * The data type stored into the database, the difference between this one and
 * the normal Portfolio type is that activitiesStartDate is formated as
 * 'YYYY-MM-DD', and the latestSnapshot field is the database compatible
 * DbSnapshot type.
 */
export type DbPortfolio = Omit<
  Portfolio,
  'activitiesStartDate' | 'latestSnapshot' | 'activities'
> & {
  activitiesStartDate?: string;
  latestSnapshot?: DbSnapshot;
};

/**
 * Convert dates into strings.
 */
export const portfolioToDb = (portfolio: Portfolio): DbPortfolio => {
  return {
    ...portfolio,
    activitiesStartDate:
      portfolio.activitiesStartDate &&
      dayjs(portfolio.activitiesStartDate).format(DATE_FORMAT),
    latestSnapshot:
      portfolio.latestSnapshot && snapshotToDb(portfolio.latestSnapshot),
  };
};

/**
 * Convert string dates into Date objects.
 */
export const portfolioFromDb = (dbPortfolio: DbPortfolio): Portfolio => {
  return {
    ...dbPortfolio,
    activitiesStartDate: dbPortfolio.activitiesStartDate
      ? dayjs(dbPortfolio.activitiesStartDate, DATE_FORMAT).toDate()
      : undefined,
    latestSnapshot: dbPortfolio.latestSnapshot
      ? snapshotFromDb(dbPortfolio.latestSnapshot)
      : undefined,
  };
};
