import InvestmentsList from './InvestmentsList';
import { fireEvent, getByText } from '@testing-library/react';
import { render, defaultPortfolioPerformance } from 'testUtils';

test('sort by today', () => {
  const { getAllByTestId, getByLabelText } = render(<InvestmentsList />);

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

test('sort by gain', () => {
  const { getAllByTestId, getByLabelText } = render(<InvestmentsList />);

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

test('sort by value', () => {
  const { getAllByTestId, getByLabelText } = render(<InvestmentsList />);

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

test('sort by allocation', () => {
  const { getAllByTestId, getByLabelText } = render(<InvestmentsList />);

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

test('manual refresh', () => {
  const mockRefresh = jest.fn();
  const { getByTestId } = render(<InvestmentsList />, {
    portfolioPerformance: {
      refresh: mockRefresh,
    },
  });

  fireEvent.click(getByTestId('refresh-btn'));
  expect(mockRefresh).toHaveBeenCalled();
});
