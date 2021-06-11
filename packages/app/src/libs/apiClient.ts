import dayjs from 'dayjs';
import {
  TimeSeries,
  StockInfo,
  StockPrice,
  StockHistoryItem,
  StockLivePrice,
} from '@tuja/libs';

const DATE_FORMAT = 'YYYY-MM-DD';

const API_URL = import.meta.env.VITE_API_URL;

export type ParsedLivePrice = Omit<StockLivePrice, 'date'> & { date: Date };

export interface StockHistory {
  ticker: string;
  close: TimeSeries;
  adjusted: TimeSeries;
  range: { startDate: Date; endDate: Date };
}

const chunkTickers = <T>(tickers: T[]) => {
  const chunkSize = 6;
  const tickerChunks: T[][] = [];
  for (let i = 0; i < tickers.length; i += chunkSize) {
    tickerChunks.push(tickers.slice(i, i + chunkSize));
  }
  return tickerChunks;
};

const joinTickers = (tickers: string[]) =>
  tickers.map((ticker) => encodeURIComponent(ticker)).join(',');

export async function fetchStockInfos(tickers: string[]) {
  const tickerChunks = chunkTickers(tickers);
  const data = await Promise.all(
    tickerChunks.map(async (chunk) =>
      fetch(`${API_URL}/bulkInfos?tickers=${joinTickers(chunk)}`).then((res) =>
        res.json()
      )
    )
  );

  return data.flatMap((chunk) => chunk) as StockInfo[];
}

export async function fetchStockLivePrices(tickers: string[]) {
  const tickerChunks = chunkTickers(tickers);
  const data: StockLivePrice[][] = await Promise.all(
    tickerChunks.map(async (chunk) =>
      fetch(`${API_URL}/bulkLivePrices?tickers=${joinTickers(chunk)}`).then(
        (res) => res.json()
      )
    )
  );
  return data.flatMap((chunk) =>
    chunk.map(
      (d: any) =>
        ({ ...d, date: new Date(d.timestamp * 1000) } as ParsedLivePrice)
    )
  );
}

export async function fetchStockHistories(
  tickers: { ticker: string; from: Date; to: Date }[]
) {
  const tickerChunks = chunkTickers(tickers);

  const data: {
    ticker: string;
    from: string;
    to: string;
    history: StockHistoryItem[];
  }[][] = await Promise.all(
    tickerChunks.map(async (chunk) => {
      const response = await fetch(
        `${API_URL}/bulkEods?query=${encodeURIComponent(
          JSON.stringify(
            chunk.map(({ ticker, from, to }) => {
              const formattedFrom = dayjs(from).format(DATE_FORMAT);
              const formattedTo = dayjs(to).format(DATE_FORMAT);
              return { ticker, from: formattedFrom, to: formattedTo };
            })
          )
        )}`
      );
      const data = await response.json();
      return data as any[];
    })
  );

  return data.flatMap((chunk) =>
    chunk.map(({ ticker, from, to, history }) => {
      const closeSeries = new TimeSeries();
      const adjustedSeries = new TimeSeries();

      closeSeries.handleData(history.map(({ date, close }) => [date, close]));
      adjustedSeries.handleData(
        history.map(({ date, adjusted_close }) => [date, adjusted_close])
      );

      return {
        ticker,
        from: dayjs(from, DATE_FORMAT).toDate(),
        to: dayjs(to, DATE_FORMAT).toDate(),
        closeSeries,
        adjustedSeries,
      };
    })
  );
}

export function fetchStockSearch(query: string) {
  const controller = new AbortController();
  const signal = controller.signal;
  return {
    fetch: async () => {
      const response = await fetch(
        `${API_URL}/search?query=${encodeURIComponent(query)}`,
        { signal }
      );
      return (await response.json()) as StockInfo[];
    },
    cancel: () => controller.abort(),
  };
}

export function fetchStocksPrices(
  tickers: string[],
  date: Date,
  currency: string
) {
  const controller = new AbortController();
  const signal = controller.signal;
  return {
    fetch: async () => {
      const data: StockPrice[] = await Promise.all(
        tickers.map(async (ticker) =>
          fetch(
            `${API_URL}/priceAt?ticker=${encodeURIComponent(ticker)}&at=${dayjs(
              date
            ).format(DATE_FORMAT)}&currency=${currency}`,
            { signal }
          ).then((res) => res.json())
        )
      );
      return data.reduce(
        (obj, price) => ({ ...obj, [price.ticker]: price }),
        {} as { [ticker: string]: StockPrice }
      );
    },
    cancel: () => controller.abort(),
  };
}

const convertBlobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(blob);
  });

export async function fetchStockLogo(ticker: string, name?: string) {
  try {
    const result = await fetch(
      `${API_URL}/stockLogo?ticker=${ticker}&name=${encodeURIComponent(
        name ?? ''
      )}&size=108`
    );
    if (result.status !== 200) {
      return '';
    }
    const blob = await result.blob();
    return convertBlobToBase64(blob);
  } catch {
    return '';
  }
}
