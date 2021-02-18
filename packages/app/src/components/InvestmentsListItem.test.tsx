import { waitFor } from '@testing-library/react';
import InvestmentsListItem from './InvestmentsListItem';
import { render } from 'testUtils';

test('render live price is not the same day', async () => {
  const { getByText } = render(
    <InvestmentsListItem
      ticker="AAPL.US"
      holdingPerformance={{
        value: 12,
        units: 5,
        info: {
          Name: 'Apple',
          Code: 'AAPL',
          Ticker: 'AAPL.US',
          Currency: 'USD',
        } as any,
        livePrice: { date: new Date(), change_p: 1.23 } as any,
      }}
      portfolioValue={123}
      mode="TODAY"
    />
  );
  await waitFor(() => {});
  expect(getByText('Apple')).toBeInTheDocument();
  expect(getByText('+1.23%')).toBeInTheDocument();
});

test('disable change percentage given previous live price', async () => {
  const { getByText } = render(
    <InvestmentsListItem
      ticker="AAPL.US"
      holdingPerformance={{
        value: 12,
        units: 5,
        info: {
          Name: 'Apple',
          Code: 'AAPL',
          Ticker: 'AAPL.US',
          Currency: 'USD',
        } as any,
        livePrice: { date: new Date(1613407679595), change_p: 1.23 } as any,
      }}
      portfolioValue={123}
      mode="TODAY"
    />
  );
  await waitFor(() => {});
  expect(getByText('0.00%')).toBeInTheDocument();
});
