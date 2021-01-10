import firebase from 'firebase/app';
import dayjs from 'dayjs';
import {
  TimeSeries,
  StockInfo,
  StockHistory,
  StockLivePrice,
} from '@tuja/libs';

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
  const chunkSize = 6;
  const tickerChunks: string[][] = [];
  for (let i = 0; i < tickers.length; i += chunkSize) {
    tickerChunks.push(tickers.slice(i, i + chunkSize));
  }
  const data = await Promise.all(
    tickerChunks.map(async (chunk) =>
      fetch(
        `${
          process.env.REACT_APP_WORKERS_URL
        }/bulkLivePrices?tickers=${chunk
          .map((ticker) => encodeURIComponent(ticker))
          .join(',')}`
      ).then((res) => res.json())
    )
  );
  return data.flatMap((chunk) =>
    chunk.map(
      (d: any) =>
        ({ ...d, date: new Date(d.timestamp * 1000) } as StockLivePrice)
    )
  );
}

export async function fetchStockSearch(query: string) {
  const searchStocks = firebase.functions().httpsCallable('searchStocks');

  const result = await searchStocks({ query });
  return result.data as StockInfo[];
}

export async function fetchStocksPrices(
  tickers: string[],
  date: Date,
  currency: string
) {
  const stocksPrices = firebase.functions().httpsCallable('stocksPrices');

  const result = await stocksPrices({
    tickers,
    date: dayjs(date).format('YYYY-MM-DD'),
    currency,
  });
  return result.data as { [ticker: string]: number };
}

export function getMissingStocksHistory(
  tickers: string[],
  stocksHistory: { [ticker: string]: StockHistory },
  startDate: Date,
  endDate: Date
) {
  const today = dayjs();
  const actualEndDate = today.isSame(endDate, 'day')
    ? dayjs(endDate).subtract(1, 'day').toDate()
    : endDate;
  return tickers.flatMap((ticker) => {
    const existingData = stocksHistory[ticker];

    if (
      !existingData ||
      !existingData.range ||
      !existingData.adjusted ||
      !existingData.close
    ) {
      return { ticker, startDate, endDate: actualEndDate };
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

    if (dayjs(actualEndDate).isAfter(existingData.range.endDate, 'date')) {
      missingData.push({
        ticker,
        startDate: dayjs(existingData.range.endDate).add(1, 'day').toDate(),
        endDate: actualEndDate,
      });
    }

    return missingData;
  });
}
