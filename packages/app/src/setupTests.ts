// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import fetch from 'node-fetch';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import minMax from 'dayjs/plugin/minMax';
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(minMax);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

const TEST_API = 'http://localhost';
import.meta.env.VITE_API_URL = TEST_API;

// @ts-ignore
window.fetch = fetch;

async function mockFetch(url: string, config: any) {
  switch (url) {
    case `${TEST_API}/bulkInfos?tickers=IUSA.LSE`: {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            Code: 'IUSA',
            Exchange: 'LSE',
            Name: 'iShares Core S&P 500 UCITS ETF USD Dist',
            Type: 'ETF',
            Country: 'UK',
            Currency: 'GBX',
            ISIN: 'IE0031442068',
            previousClose: 2777.375,
            previousCloseDate: '2021-03-02',
            Ticker: 'IUSA.LSE',
          },
        ],
      };
    }
    case `${TEST_API}/bulkEods?query=%5B%7B%22ticker%22%3A%22IUSA.LSE%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%5D`: {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            ticker: 'IUSA.LSE',
            from: '2021-02-08',
            to: '2021-02-09',
            history: [
              {
                date: '2021-02-08',
                open: 2829,
                high: 2840.5,
                low: 2827.75,
                close: 2827.75,
                adjusted_close: 2827.75,
                volume: 213126,
              },
              {
                date: '2021-02-09',
                open: 2831,
                high: 2834.653,
                low: 2822.5,
                close: 2823.875,
                adjusted_close: 2823.875,
                volume: 75581,
              },
            ],
          },
        ],
      };
    }
    case `${TEST_API}/bulkLivePrices?tickers=IUSA.LSE`: {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            code: 'IUSA.LSE',
            timestamp: 1614702540,
            gmtoffset: 0,
            open: 2787.9331,
            high: 2797.25,
            low: 2772.71,
            close: 2777.375,
            volume: 287103,
            previousClose: 2784.875,
            change: -7.5,
            change_p: -0.2693,
          },
        ],
      };
    }

    default: {
      if (url.startsWith(`${TEST_API}/stockLogo`)) {
        return { ok: true, status: 200, blob: () => new Blob() };
      }

      // console.warn(`Unhandled request: ${url}`);
      return fetch(url, config);
    }
  }
}
beforeAll(() => jest.spyOn(window, 'fetch'));
beforeEach(() => {
  (window.fetch as any).mockImplementation(mockFetch);
  (window.indexedDB as any) = new FDBFactory();
});
