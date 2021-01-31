import { render } from '../../testUtils';
import ActivityItem from './ActivityItem';

const DATE = new Date(1612133609473);
const FORMATTED_DATE = '2021-01-31';

test('render deposit type', () => {
  const { getByText } = render(
    <ActivityItem
      activity={{
        id: 'a',
        date: DATE,
        type: 'Deposit',
        amount: 500,
      }}
      currency="GBP"
    />
  );
  expect(getByText('Deposit')).toBeInTheDocument();
  expect(getByText(FORMATTED_DATE)).toBeInTheDocument();
  expect(getByText('+£500.00')).toBeInTheDocument();
});

test('render cash dividend type', () => {
  const { getByText } = render(
    <ActivityItem
      activity={{
        id: 'a',
        date: new Date(),
        type: 'Dividend',
        ticker: 'IWDP.LSE',
        amount: 1.53,
      }}
      currency="GBP"
      getStockName={() => 'Developed Markets Property'}
    />
  );
  expect(getByText('Cash Dividend')).toBeInTheDocument();
  expect(getByText(FORMATTED_DATE)).toBeInTheDocument();
  expect(getByText('£1.53')).toBeInTheDocument();
  expect(getByText('IWDP · Developed Markets Property')).toBeInTheDocument();
});

test('render stock dividend type', () => {
  const { getByText } = render(
    <ActivityItem
      activity={{
        id: 'a',
        date: new Date(),
        type: 'StockDividend',
        ticker: 'AAPL.US',
        units: 3,
      }}
      currency="GBP"
      getStockName={() => 'Apple Ltd.'}
    />
  );
  expect(getByText('Stock Dividend')).toBeInTheDocument();
  expect(getByText(FORMATTED_DATE)).toBeInTheDocument();
  expect(getByText('3 Shares')).toBeInTheDocument();
  expect(getByText('AAPL · Apple Ltd.')).toBeInTheDocument();
});

test('render buy type', () => {
  const { getByText } = render(
    <ActivityItem
      activity={{
        id: 'a',
        date: new Date(),
        type: 'Trade',
        cost: 123.45,
        trades: [{ ticker: 'IWDP.LSE', units: 1 }],
      }}
      currency="GBP"
      getStockName={() => 'Developed Markets Property'}
    />
  );
  expect(getByText('Buy')).toBeInTheDocument();
  expect(getByText(FORMATTED_DATE)).toBeInTheDocument();
  expect(getByText('£123.45')).toBeInTheDocument();
  expect(getByText('IWDP · Developed Markets Property')).toBeInTheDocument();
  expect(getByText('+1')).toBeInTheDocument();
});

test('render sell type', () => {
  const { getByText } = render(
    <ActivityItem
      activity={{
        id: 'a',
        date: new Date(),
        type: 'Trade',
        cost: -123.45,
        trades: [
          { ticker: 'AAPL.US', units: 1.2345678 },
          { ticker: 'IWDP.LSE', units: 1 },
        ],
      }}
      currency="GBP"
    />
  );
  expect(getByText('Sell')).toBeInTheDocument();
  expect(getByText(FORMATTED_DATE)).toBeInTheDocument();
  expect(getByText('£123.45')).toBeInTheDocument();
  expect(getByText('AAPL')).toBeInTheDocument();
  expect(getByText('IWDP')).toBeInTheDocument();
  expect(getByText('+1.2345678')).toBeInTheDocument();
  expect(getByText('+1')).toBeInTheDocument();
});
