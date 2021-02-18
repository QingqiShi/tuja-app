import { fireEvent, getByText, waitFor } from '@testing-library/react';
import { render, defaultPortfolioPerformance } from 'testUtils';
import InvestmentsList from './InvestmentsList';

test('sort by today', async () => {
  const { getAllByTestId, getByLabelText } = render(<InvestmentsList />);
  await waitFor(() => {});

  fireEvent.change(getByLabelText('Sort by'), { target: { value: 'TODAY' } });

  const investmentItems = getAllByTestId('investment-item');
  expect(investmentItems).toHaveLength(2);
  expect(
    getByText(
      investmentItems[0],
      defaultPortfolioPerformance.holdings['IUSA.LSE'].info.Name
    )
  ).toBeInTheDocument();
  expect(
    getByText(
      investmentItems[1],
      defaultPortfolioPerformance.holdings['AAPL.US'].info.Name
    )
  ).toBeInTheDocument();
});

test('sort by gain', async () => {
  const { getAllByTestId, getByLabelText } = render(<InvestmentsList />);
  await waitFor(() => {});

  fireEvent.change(getByLabelText('Sort by'), { target: { value: 'GAIN' } });

  const investmentItems = getAllByTestId('investment-item');
  expect(investmentItems).toHaveLength(2);
  expect(
    getByText(
      investmentItems[0],
      defaultPortfolioPerformance.holdings['IUSA.LSE'].info.Name
    )
  ).toBeInTheDocument();
  expect(
    getByText(
      investmentItems[1],
      defaultPortfolioPerformance.holdings['AAPL.US'].info.Name
    )
  ).toBeInTheDocument();
});

test('sort by value', async () => {
  const { getAllByTestId, getByLabelText } = render(<InvestmentsList />);
  await waitFor(() => {});

  fireEvent.change(getByLabelText('Sort by'), { target: { value: 'VALUE' } });

  const investmentItems = getAllByTestId('investment-item');
  expect(investmentItems).toHaveLength(2);
  expect(
    getByText(
      investmentItems[0],
      defaultPortfolioPerformance.holdings['AAPL.US'].info.Name
    )
  ).toBeInTheDocument();
  expect(
    getByText(
      investmentItems[1],
      defaultPortfolioPerformance.holdings['IUSA.LSE'].info.Name
    )
  ).toBeInTheDocument();
});

test('sort by allocation', async () => {
  const { getAllByTestId, getByLabelText } = render(<InvestmentsList />);
  await waitFor(() => {});

  fireEvent.change(getByLabelText('Sort by'), {
    target: { value: 'ALLOCATION' },
  });

  const investmentItems = getAllByTestId('investment-item');
  expect(investmentItems).toHaveLength(2);
  expect(
    getByText(
      investmentItems[0],
      defaultPortfolioPerformance.holdings['AAPL.US'].info.Name
    )
  ).toBeInTheDocument();
  expect(
    getByText(
      investmentItems[1],
      defaultPortfolioPerformance.holdings['IUSA.LSE'].info.Name
    )
  ).toBeInTheDocument();
});

test('manual refresh', async () => {
  const mockRefresh = jest.fn();
  const { getByTestId } = render(<InvestmentsList />, {
    portfolioPerformance: {
      refresh: mockRefresh,
    },
  });
  await waitFor(() => {});

  fireEvent.click(getByTestId('refresh-btn'));
  expect(mockRefresh).toHaveBeenCalled();
});
