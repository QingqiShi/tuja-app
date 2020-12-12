import firebase from 'firebase/app';
import dayjs from 'dayjs';
import { TimeSeries } from '@tuja/libs';

export interface StockInfo {
  Ticker: string;
  Code: string;
  Name: string;
  Country: string;
  Exchange: string;
  Currency: string;
  Type?: string;
}

export interface StockHistory {
  ticker: string;
  close: TimeSeries;
  adjusted: TimeSeries;
  range: { startDate: Date; endDate: Date };
}

export interface StockLivePrice {
  date: Date;
  code: string;
  close: number;
  previousClose: number;
  timestamp?: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
  change?: number;
  change_p?: number;
}

export interface StocksData {
  [ticker: string]: {
    info?: StockInfo;
    livePrice?: StockLivePrice;
    closeSeries?: TimeSeries;
    adjustedSeries?: TimeSeries;
    seriesRange?: {
      startDate: Date;
      endDate: Date;
    };
  };
}

export async function fetchStocksHistory(ticker: string, from: Date, to: Date) {
  const formattedFrom = dayjs(from).format('YYYY-MM-DD');
  const formattedTo = dayjs(to).format('YYYY-MM-DD');
  const stockHistory = firebase.functions().httpsCallable('stockHistory');

  const result = await stockHistory({
    ticker,
    from: formattedFrom,
    to: formattedTo,
  });

  const closeSeries = new TimeSeries();
  const adjustedSeries = new TimeSeries();

  closeSeries.handleData(
    result.data.map(({ date, close }: { date: string; close: number }) => [
      date,
      close,
    ])
  );
  adjustedSeries.handleData(
    result.data.map(
      ({ date, adjusted_close }: { date: string; adjusted_close: number }) => [
        date,
        adjusted_close,
      ]
    )
  );

  return { closeSeries, adjustedSeries };
}

export async function fetchStocksInfo(tickers: string[]) {
  const stocksInfo = firebase.functions().httpsCallable('stocksInfo');

  const result = await stocksInfo({ tickers });
  return result.data as StockInfo[];
}

export async function fetchStockLivePrice(tickers: string[]) {
  const stockLivePrice = firebase.functions().httpsCallable('stockLivePrice');

  const result = await stockLivePrice({ tickers });
  return result.data.map((data: any) => ({
    ...data,
    date: new Date(data.timestamp * 1000),
  })) as StockLivePrice[];
}

export function shouldFetchData(
  ticker: string,
  stocksData: StocksData,
  startDate?: Date | null,
  endDate?: Date | null
) {
  if (!startDate || !endDate) return false;

  return (
    !(ticker in stocksData) ||
    !stocksData[ticker].closeSeries ||
    !stocksData[ticker].adjustedSeries?.data.length ||
    !stocksData[ticker].seriesRange?.startDate ||
    !stocksData[ticker].seriesRange?.endDate ||
    dayjs(stocksData[ticker].seriesRange?.startDate).isAfter(
      startDate,
      'day'
    ) ||
    dayjs(endDate).isAfter(
      stocksData[ticker].seriesRange?.endDate as Date,
      'day'
    )
  );
}

export function resolveMissingStocksHistory(
  tickers: string[],
  stocksData: StocksData,
  startDate: Date,
  endDate: Date
) {
  return tickers.flatMap((ticker) => {
    const existingData = stocksData[ticker];

    if (
      !existingData ||
      !existingData.seriesRange ||
      !existingData.adjustedSeries ||
      !existingData.closeSeries
    ) {
      return { ticker, startDate, endDate };
    }

    const missingData = [];

    if (dayjs(startDate).isBefore(existingData.seriesRange.startDate, 'date')) {
      missingData.push({
        ticker,
        startDate,
        endDate: dayjs(existingData.seriesRange.startDate)
          .subtract(1, 'day')
          .toDate(),
      });
    }

    if (dayjs(endDate).isAfter(existingData.seriesRange.endDate, 'date')) {
      missingData.push({
        ticker,
        startDate: dayjs(existingData.seriesRange.endDate)
          .add(1, 'day')
          .toDate(),
        endDate,
      });
    }

    return missingData;
  });
}

export function getMissingStocksHistory(
  tickers: string[],
  stocksHistory: { [ticker: string]: StockHistory },
  startDate: Date,
  endDate: Date
) {
  return tickers.flatMap((ticker) => {
    const existingData = stocksHistory[ticker];

    if (
      !existingData ||
      !existingData.range ||
      !existingData.adjusted ||
      !existingData.close
    ) {
      return { ticker, startDate, endDate };
    }

    const missingData = [];

    if (dayjs(startDate).isBefore(existingData.range.startDate, 'date')) {
      missingData.push({
        ticker,
        startDate,
        endDate: dayjs(existingData.range.startDate)
          .subtract(1, 'day')
          .toDate(),
      });
    }

    if (dayjs(endDate).isAfter(existingData.range.endDate, 'date')) {
      missingData.push({
        ticker,
        startDate: dayjs(existingData.range.endDate).add(1, 'day').toDate(),
        endDate,
      });
    }

    return missingData;
  });
}
