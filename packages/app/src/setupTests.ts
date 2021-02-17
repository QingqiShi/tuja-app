// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

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

const TEST_API = 'http://api.test.com';
(process.env as any).REACT_APP_WORKERS_URL = TEST_API;

async function mockFetch(url: string, config: any) {
  switch (url) {
    case `${TEST_API}/bulkInfos?tickers=MSFT.US,AAPL.US`: {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            Code: 'MSFT',
            Exchange: 'US',
            Name: 'Microsoft Corporation',
            Type: 'Common Stock',
            Country: 'USA',
            Currency: 'USD',
            ISIN: 'US5949181045',
            previousClose: 244.99,
            previousCloseDate: '2021-02-12',
            Ticker: 'MSFT.US',
          },
          {
            Code: 'AAPL',
            Exchange: 'US',
            Name: 'Apple Inc',
            Type: 'Common Stock',
            Country: 'USA',
            Currency: 'USD',
            ISIN: 'US0378331005',
            previousClose: 135.37,
            previousCloseDate: '2021-02-12',
            Ticker: 'AAPL.US',
          },
        ],
      };
    }
    case `${TEST_API}/bulkEods?query=%5B%7B%22ticker%22%3A%22MSFT.US%22%2C%22from%22%3A%222021-02-07%22%2C%22to%22%3A%222021-02-10%22%7D%2C%7B%22ticker%22%3A%22AAPL.US%22%2C%22from%22%3A%222021-02-07%22%2C%22to%22%3A%222021-02-10%22%7D%2C%7B%22ticker%22%3A%22USDGBP.FOREX%22%2C%22from%22%3A%222021-02-07%22%2C%22to%22%3A%222021-02-10%22%7D%5D`: {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            ticker: 'MSFT.US',
            from: '2021-02-07',
            to: '2021-02-10',
            history: [
              {
                date: '2021-02-08',
                open: 243.15,
                high: 243.68,
                low: 240.81,
                close: 242.47,
                adjusted_close: 242.47,
                volume: 22211900,
              },
              {
                date: '2021-02-09',
                open: 241.87,
                high: 244.76,
                low: 241.38,
                close: 243.77,
                adjusted_close: 243.77,
                volume: 23565000,
              },
              {
                date: '2021-02-10',
                open: 245,
                high: 245.92,
                low: 240.89,
                close: 242.82,
                adjusted_close: 242.82,
                volume: 22186700,
              },
            ],
          },
          {
            ticker: 'AAPL.US',
            from: '2021-02-07',
            to: '2021-02-10',
            history: [
              {
                date: '2021-02-08',
                open: 136.03,
                high: 136.96,
                low: 134.92,
                close: 136.91,
                adjusted_close: 136.91,
                volume: 71297200,
              },
              {
                date: '2021-02-09',
                open: 136.62,
                high: 137.88,
                low: 135.85,
                close: 136.01,
                adjusted_close: 136.01,
                volume: 76774200,
              },
              {
                date: '2021-02-10',
                open: 136.48,
                high: 136.99,
                low: 134.4,
                close: 135.39,
                adjusted_close: 135.39,
                volume: 73046600,
              },
            ],
          },
          {
            ticker: 'USDGBP.FOREX',
            from: '2021-02-07',
            to: '2021-02-10',
            history: [
              {
                date: '2021-02-07',
                open: 0.7283,
                high: 0.7293,
                low: 0.7278,
                close: 0.7282,
                adjusted_close: 0.7282,
                volume: 0,
              },
              {
                date: '2021-02-08',
                open: 0.7283,
                high: 0.7309,
                low: 0.7272,
                close: 0.7278,
                adjusted_close: 0.7278,
                volume: 0,
              },
              {
                date: '2021-02-09',
                open: 0.7277,
                high: 0.7279,
                low: 0.7234,
                close: 0.7238,
                adjusted_close: 0.7238,
                volume: 0,
              },
              {
                date: '2021-02-10',
                open: 0.7237,
                high: 0.7245,
                low: 0.721,
                close: 0.723,
                adjusted_close: 0.723,
                volume: 0,
              },
            ],
          },
        ],
      };
    }
    case `${TEST_API}/bulkLivePrices?tickers=MSFT.US,AAPL.US,USDGBP.FOREX`: {
      return {
        ok: true,
        status: 200,
        json: async () => [
          {
            code: 'MSFT.US',
            timestamp: 1613163600,
            gmtoffset: 0,
            open: 243.9332,
            high: 245.29,
            low: 242.74,
            close: 244.99,
            volume: 16561079,
            previousClose: 244.49,
            change: 0.5,
            change_p: 0.2045,
          },
          {
            code: 'AAPL.US',
            timestamp: 1613163600,
            gmtoffset: 0,
            open: 134.35,
            high: 135.51,
            low: 133.6921,
            close: 135.37,
            volume: 60145130,
            previousClose: 135.13,
            change: 0.24,
            change_p: 0.1776,
          },
          {
            code: 'USDGBP.FOREX',
            timestamp: 1613330460,
            gmtoffset: 0,
            open: 0.7219,
            high: 0.722,
            low: 0.7197,
            close: 0.7218,
            volume: 0,
            previousClose: 0.7238,
            change: -0.002,
            change_p: -0.2763,
          },
        ],
      };
    }

    case 'blob:http://localhost/7cde14af-cabf-4a97-849b-cf46f2c0d223':
      return { blob: async () => {} };

    default: {
      throw new Error(`Unhandled request: ${url}`);
    }
  }
}
beforeAll(() => jest.spyOn(window, 'fetch'));
beforeEach(() => (window.fetch as any).mockImplementation(mockFetch));
