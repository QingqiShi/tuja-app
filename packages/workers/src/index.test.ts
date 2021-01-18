import fetch from 'node-fetch';

test('search', async () => {
  const response = await fetch('http://localhost:8787/search?query=aapl');
  const result = await response.json();
  expect(result).toEqual([
    {
      Code: 'AAPL',
      Country: 'USA',
      Currency: 'USD',
      Exchange: 'US',
      ISIN: 'US0378331005',
      Name: 'Apple Inc',
      Ticker: 'AAPL.US',
      Type: 'Common Stock',
      previousClose: 127.14,
      previousCloseDate: '2021-01-15',
    },
    {
      Code: 'AAPL',
      Country: 'Mexico',
      Currency: 'MXN',
      Exchange: 'MX',
      ISIN: null,
      Name: 'Apple Inc',
      Ticker: 'AAPL.MX',
      Type: 'Common Stock',
      previousClose: 2540.01,
      previousCloseDate: '2021-01-18',
    },
    {
      Code: 'AAPL34',
      Country: 'Brazil',
      Currency: 'BRL',
      Exchange: 'SA',
      ISIN: null,
      Name: 'Apple Inc',
      Ticker: 'AAPL34.SA',
      Type: 'Preferred Stock',
      previousClose: 67.3,
      previousCloseDate: '2021-01-15',
    },
  ]);
});
