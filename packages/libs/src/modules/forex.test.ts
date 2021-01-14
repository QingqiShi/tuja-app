import {
  normalizeForex,
  getForexPair,
  exchangeCurrency,
  formatCurrency,
  parseCurrency,
} from './forex';

test('normalize GBX currency', () => {
  expect(normalizeForex('GBX')).toEqual({ currency: 'GBP' });
  expect(normalizeForex('GBX', 500)).toEqual({ currency: 'GBP', value: 5 });
});

test('normalize other currencies', () => {
  expect(normalizeForex('GBP')).toEqual({ currency: 'GBP' });
  expect(normalizeForex('GBP', 50)).toEqual({ currency: 'GBP', value: 50 });
  expect(normalizeForex('USD', 50)).toEqual({ currency: 'USD', value: 50 });
});

test('generate forext pair tickers', () => {
  expect(getForexPair('USD', 'GBP')).toBe('USDGBP.FOREX');
});

test('exchange value from currency to base currency', () => {
  expect(
    exchangeCurrency(50, 'A', 'B', (pair) => (pair === 'AB.FOREX' ? 0.5 : 1))
  ).toBe(25);
});

test('exchange currency normalizes amount', () => {
  expect(
    exchangeCurrency(1000, 'GBX', 'USD', (pair) =>
      pair === 'GBPUSD.FOREX' ? 1.2 : 1
    )
  ).toBe(12);
});

test('exchange currency returns value if same as base currency', () => {
  expect(exchangeCurrency(1000, 'GBX', 'GBP', () => 0)).toBe(10);
});

test('exchange currency with missing exchange rate', () => {
  expect(exchangeCurrency(100, 'USD', 'GBP', () => undefined)).toBe(100);
});

test('format currency', () => {
  expect(formatCurrency('GBP', 123)).toBe('£123.00');
  expect(formatCurrency('USD', 12.3)).toBe('$12.30');
  expect(formatCurrency('EUR', 1.23)).toBe('€1.23');
});

test('parse currency', () => {
  expect(parseCurrency('GBP', '£123.00')).toBe(123);
  expect(parseCurrency('USD', '$12.30')).toBe(12.3);
  expect(parseCurrency('EUR', '€1.23')).toBe(1.23);
  expect(parseCurrency('USD', '$1,000,000.00')).toBe(1000000);
});
