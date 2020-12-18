import dayjs from 'dayjs';
import type { Activity } from '@tuja/libs';

// An item that describes all activities for a given date
export interface ActivityIterateItem {
  date: Date;
  deposit: number;
  trades: { [ticker: string]: number };
  totalTradeCost: number;
  cashDividend: number;
  stockDividend: { [ticker: string]: number };
}

/**
 * Convert activities list into something that can be iterated over day by day
 */
export function getActivitiesIterator(activities: Activity[]) {
  return activities.reduce((accumulated, activity) => {
    const shouldUseLast =
      accumulated.length &&
      dayjs(accumulated[accumulated.length - 1].date).isSame(
        activity.date,
        'day'
      );
    const item: ActivityIterateItem = shouldUseLast
      ? accumulated[accumulated.length - 1]
      : {
          date: activity.date,
          deposit: 0,
          trades: {},
          totalTradeCost: 0,
          cashDividend: 0,
          stockDividend: {},
        };

    switch (activity.type) {
      case 'Deposit':
        item.deposit += activity.amount;
        break;
      case 'Dividend':
        item.cashDividend += activity.amount;
        break;
      case 'StockDividend':
        item.stockDividend[activity.ticker] =
          (item.stockDividend[activity.ticker] ?? 0) + activity.units;
        break;
      case 'Trade':
        item.totalTradeCost += activity.cost;
        activity.trades.forEach((trade) => {
          item.trades[trade.ticker] =
            (item.trades[trade.ticker] ?? 0) + trade.units;
        });
        break;
    }

    if (!shouldUseLast) {
      accumulated.push(item);
    }
    return accumulated;
  }, [] as ActivityIterateItem[]);
}

/**
 * Utility to resolve an array of activities
 */
export function iterateActivities(
  activityIterator: ActivityIterateItem[],
  {
    onActivity,
    onDate,
  }: {
    onActivity: (item: ActivityIterateItem) => void;
    onDate: (date: Date) => void;
  }
) {
  const currentDate = new Date();
  let prevDate: Date | null = null;

  activityIterator.forEach((item) => {
    if (prevDate) {
      for (
        let day = dayjs(prevDate);
        day.isBefore(item.date, 'day');
        day = day.add(1, 'day')
      ) {
        onDate(day.toDate());
      }
    }

    onActivity(item);

    prevDate = item.date;
  });

  if (prevDate) {
    for (
      let day = dayjs(prevDate);
      day.isSameOrBefore(currentDate);
      day = day.add(1, 'day')
    ) {
      onDate(day.toDate());
    }
  }
}
