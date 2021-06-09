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
  if (config?.signal?.aborted) {
    throw new Error('fake abort error');
  }

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
    case `${TEST_API}/bulkInfos?tickers=IWDP.LSE,AAPL.US,IUSA.LSE,IUS3.XETRA,SGLN.LSE,HMCH.LSE`: {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            Code: 'IWDP',
            Exchange: 'LSE',
            Name: 'iShares II Public Limited Company - iShares Developed Markets Property Yield UCITS ETF',
            Type: 'ETF',
            Country: 'UK',
            Currency: 'GBX',
            ISIN: 'IE00B1FZS350',
            previousClose: 2061.25,
            previousCloseDate: '2021-06-08',
            Ticker: 'IWDP.LSE',
          },
          {
            Code: 'AAPL',
            Exchange: 'US',
            Name: 'Apple Inc',
            Type: 'Common Stock',
            Country: 'USA',
            Currency: 'USD',
            ISIN: 'US0378331005',
            previousClose: 126.74,
            previousCloseDate: '2021-06-08',
            Ticker: 'AAPL.US',
          },
          {
            Code: 'IUSA',
            Exchange: 'LSE',
            Name: 'iShares Core S&P 500 UCITS ETF USD Dist',
            Type: 'ETF',
            Country: 'UK',
            Currency: 'GBX',
            ISIN: 'IE0031442068',
            previousClose: 2972.125,
            previousCloseDate: '2021-06-08',
            Ticker: 'IUSA.LSE',
          },
          {
            Code: 'IUS3',
            Exchange: 'XETRA',
            Name: 'iShares S&P SmallCap 600 UCITS ETF USD (Dist)',
            Type: 'ETF',
            Country: 'Germany',
            Currency: 'EUR',
            ISIN: 'IE00B2QWCY14',
            previousClose: 76.8,
            previousCloseDate: '2021-06-08',
            Ticker: 'IUS3.XETRA',
          },
          {
            Code: 'SGLN',
            Exchange: 'LSE',
            Name: 'iShares Physical Gold ETC',
            Type: 'ETF',
            Country: 'UK',
            Currency: 'GBX',
            ISIN: 'IE00B4ND3602',
            previousClose: 2612,
            previousCloseDate: '2021-06-08',
            Ticker: 'SGLN.LSE',
          },
          {
            Code: 'HMCH',
            Exchange: 'LSE',
            Name: 'HSBC ETFs Public Limited Company - HSBC MSCI China UCITS ETF',
            Type: 'ETF',
            Country: 'UK',
            Currency: 'GBX',
            ISIN: 'IE00B44T3H88',
            previousClose: 769.138,
            previousCloseDate: '2021-06-08',
            Ticker: 'HMCH.LSE',
          },
        ],
      };
    }
    case `${TEST_API}/bulkInfos?tickers=T.US,USSC.LSE,VWRL.LSE`: {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            Code: 'T',
            Exchange: 'US',
            Name: 'AT&T Inc',
            Type: 'Common Stock',
            Country: 'USA',
            Currency: 'USD',
            ISIN: 'US00206R1023',
            previousClose: 28.98,
            previousCloseDate: '2021-06-08',
            Ticker: 'T.US',
          },
          {
            Code: 'USSC',
            Exchange: 'LSE',
            Name: 'SPDR MSCI USA Small Cap Value Weighted UCITS ETF USD Acc',
            Type: 'ETF',
            Country: 'UK',
            Currency: 'USD',
            ISIN: 'IE00BSPLC413',
            previousClose: 57.075,
            previousCloseDate: '2021-06-08',
            Ticker: 'USSC.LSE',
          },
          {
            Code: 'VWRL',
            Exchange: 'LSE',
            Name: 'Vanguard FTSE All-World UCITS ETF',
            Type: 'ETF',
            Country: 'UK',
            Currency: 'GBP',
            ISIN: 'IE00B3RBWM25',
            previousClose: 83.65,
            previousCloseDate: '2021-06-08',
            Ticker: 'VWRL.LSE',
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
    case `${TEST_API}/bulkLivePrices?tickers=IWDP.LSE,AAPL.US,IUSA.LSE,IUS3.XETRA,SGLN.LSE,HMCH.LSE`: {
      const fakePrice = {
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
      };
      return {
        ok: true,
        status: 200,
        json: async () => [
          { ...fakePrice, code: 'IWDP.LSE' },
          { ...fakePrice, code: 'AAPL.US' },
          { ...fakePrice, code: 'IUSA.LSE' },
          { ...fakePrice, code: 'IUS3.XETRA' },
          { ...fakePrice, code: 'SGLN.LSE' },
          { ...fakePrice, code: 'HMCH.LSE' },
        ],
      };
    }
    case `${TEST_API}/bulkLivePrices?tickers=T.US,USSC.LSE,VWRL.LSE`: {
      const fakePrice = {
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
      };
      return {
        ok: true,
        status: 200,
        json: async () => [
          { ...fakePrice, code: 'T.US' },
          { ...fakePrice, code: 'USSC.LSE' },
          { ...fakePrice, code: 'VWRL.LSE' },
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
    case `${TEST_API}/bulkEods?query=%5B%7B%22ticker%22%3A%22AAPL.US%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22HMCH.LSE%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22IUSA.LSE%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22IWDP.LSE%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22IUS3.XETRA%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22SGLN.LSE%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%5D`: {
      const fakeHistory = [
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
      ];
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            ticker: 'AAPL.US',
            from: '2021-02-08',
            to: '2021-02-09',
            history: fakeHistory,
          },
          {
            ticker: 'HMCH.LSE',
            from: '2021-02-08',
            to: '2021-02-09',
            history: fakeHistory,
          },
          {
            ticker: 'IUSA.LSE',
            from: '2021-02-08',
            to: '2021-02-09',
            history: fakeHistory,
          },
          {
            ticker: 'IWDP.LSE',
            from: '2021-02-08',
            to: '2021-02-09',
            history: fakeHistory,
          },
          {
            ticker: 'IUS3.XETRA',
            from: '2021-02-08',
            to: '2021-02-09',
            history: fakeHistory,
          },
          {
            ticker: 'SGLN.LSE',
            from: '2021-02-08',
            to: '2021-02-09',
            history: fakeHistory,
          },
        ],
      };
    }
    case `${TEST_API}/bulkEods?query=%5B%7B%22ticker%22%3A%22DIS.US%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%2C%7B%22ticker%22%3A%22FB.US%22%2C%22from%22%3A%222021-02-08%22%2C%22to%22%3A%222021-02-09%22%7D%5D`: {
      const fakeHistory = [
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
      ];
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            ticker: 'DIS.US',
            from: '2021-02-08',
            to: '2021-02-09',
            history: fakeHistory,
          },
          {
            ticker: 'FB.US',
            from: '2021-02-08',
            to: '2021-02-09',
            history: fakeHistory,
          },
        ],
      };
    }
    case `${TEST_API}/search?query=Apple%20Inc`: {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            Code: 'AAPL',
            Country: 'USA',
            Currency: 'USD',
            Exchange: 'US',
            ISIN: 'US0378331005',
            Name: 'Apple Inc',
            Ticker: 'AAPL.US',
            Type: 'Common Stock',
            previousClose: 126.74,
            previousCloseDate: '2021-06-08',
          },
        ],
      };
    }
    case `${TEST_API}/priceAt?ticker=AAPL.US&at=2021-02-08&currency=GBP`: {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          price: 127.145,
          priceInCurrency: 90.120376,
          ticker: 'AAPL.US',
        }),
      };
    }
    case `${TEST_API}/priceAt?ticker=IUSA.LSE&at=2021-02-08&currency=GBP`: {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          price: 29.91625,
          priceInCurrency: 29.91625,
          ticker: 'IUSA.LSE',
        }),
      };
    }

    default: {
      if (url.startsWith(`${TEST_API}/stockLogo`)) {
        return { ok: true, status: 200, blob: () => new Blob() };
      }

      throw new Error(`Unhandled request: ${url}`);
    }
  }
}
beforeAll(() => jest.spyOn(window, 'fetch'));
beforeEach(() => {
  (window.fetch as any).mockImplementation(mockFetch);
  (window.indexedDB as any) = new FDBFactory();
});
