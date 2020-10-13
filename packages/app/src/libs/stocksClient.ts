import { functions } from 'firebase/app';
import dayjs from 'dayjs';
import escapeRegexp from 'escape-string-regexp';
import TimeSeries from './timeSeries';

export interface StockInfo {
  Ticker: string;
  Code: string;
  Name: string;
  Country: string;
  Exchange: string;
  Currency: string;
  Type?: string;
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

type SupportedBaseCurrency = 'GBP' | 'USD';

export async function fetchStocksHistory(ticker: string, from: Date, to: Date) {
  const formattedFrom = dayjs(from).format('YYYY-MM-DD');
  const formattedTo = dayjs(to).format('YYYY-MM-DD');
  const stockHistory = functions().httpsCallable('stockHistory');

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
  const stocksInfo = functions().httpsCallable('stocksInfo');

  const result = await stocksInfo({ tickers });
  return result.data as StockInfo[];
}

export async function fetchStockLivePrice(ticker: string) {
  const stockLivePrice = functions().httpsCallable('stockLivePrice');

  const result = await stockLivePrice({ ticker });
  return {
    ...result.data,
    date: new Date(result.data.timestamp * 1000),
  } as StockLivePrice;
}

const currencyNormalisation: {
  [currency: string]: { normalise: (x: number) => number; target: string };
} = {
  GBX: {
    normalise: (x: number) => x / 100,
    target: 'GBP',
  },
};

const currencyPairs: { [currency: string]: { [currency: string]: string } } = {
  GBP: {
    USD: 'GBPUSD.FOREX',
    EUR: 'GBPEUR.FOREX',
  },
  USD: {
    GBP: 'GBPUSD.FOREX',
  },
};

export function getRequiredCurrencies(
  baseCurrency: SupportedBaseCurrency,
  stockInfos: StockInfo[]
) {
  return Array.from(
    new Set(
      stockInfos
        .map((info) =>
          info.Currency in currencyNormalisation
            ? currencyNormalisation[info.Currency].target
            : info.Currency
        )
        .filter((currency) => currency !== baseCurrency)
        .map((currency) => currencyPairs[baseCurrency][currency])
        .filter((currency) => !!currency)
    )
  );
}

export function exchangeCurrency(
  value: number,
  stockCurrency: string,
  baseCurrency: string,
  date: Date,
  stocksData: { [currency: string]: { closeSeries?: TimeSeries } }
) {
  const normalisedValue =
    stockCurrency in currencyNormalisation
      ? currencyNormalisation[stockCurrency].normalise(value)
      : value;
  const normalisedCurrency =
    stockCurrency in currencyNormalisation
      ? currencyNormalisation[stockCurrency].target
      : stockCurrency;

  if (normalisedCurrency === baseCurrency) {
    return normalisedValue;
  }

  if (baseCurrency === 'GBP' && normalisedCurrency === 'USD') {
    return value / (stocksData['GBPUSD.FOREX']?.closeSeries?.get(date) ?? 1);
  }
  if (baseCurrency === 'GBP' && normalisedCurrency === 'EUR') {
    return value / (stocksData['GBPEUR.FOREX']?.closeSeries?.get(date) ?? 1);
  }
  if (baseCurrency === 'USD' && normalisedCurrency === 'GBP') {
    return value * (stocksData['GBPUSD.FOREX']?.closeSeries?.get(date) ?? 1);
  }
  return value;
}

export function formatCurrency(currency: string, value: number) {
  const normalisedValue =
    currency in currencyNormalisation
      ? currencyNormalisation[currency].normalise(value)
      : value;
  const normalisedCurrency =
    currency in currencyNormalisation
      ? currencyNormalisation[currency].target
      : currency;
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : undefined, {
    style: 'currency',
    currency: normalisedCurrency,
  }).format(normalisedValue);
}

export function parseCurrency(currency: string, source: string) {
  const parts = new Intl.NumberFormat(
    currency === 'USD' ? 'en-US' : undefined,
    { style: 'currency', currency }
  ).formatToParts(100000000);
  const groupChar = parts.find((part) => part.type === 'group')?.value ?? '';
  const currencyChar =
    parts.find((part) => part.type === 'currency')?.value ?? '';

  const raw = source
    .replace(new RegExp(escapeRegexp(groupChar), 'g'), '')
    .replace(new RegExp(escapeRegexp(currencyChar), 'g'), '')
    .trim();

  return parseFloat(raw);
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
