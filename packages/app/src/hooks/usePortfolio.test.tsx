import { act } from '@testing-library/react';
import { render } from '../testUtils';
import usePortfolio, { PortfolioProvider } from './usePortfolio';

const mockLogEvent = jest.fn();
const mockCollection = jest.fn();
const mockWhere = jest.fn();
const mockRef = { onSnapshot: jest.fn() };
jest.mock('firebase/app', () => ({
  analytics: () => ({ logEvent: mockLogEvent }),
  firestore: () => ({
    collection: mockCollection,
  }),
}));

beforeEach(() => {
  mockWhere.mockReturnValue(mockRef);
  mockCollection.mockReturnValue({ where: mockWhere });
});

const TestComponent = () => {
  const { loaded, portfolios, portfolio } = usePortfolio();
  return (
    <div>
      <span>children</span>
      <span>{loaded ? 'loaded' : 'not loaded'}</span>
      {!!portfolios.length && (
        <span>{portfolios.map((p) => p.id).join(',')}</span>
      )}
      {portfolio && <span>{portfolio.id}</span>}
    </div>
  );
};

test('render children', () => {
  const { getByText } = render(
    <PortfolioProvider>
      <TestComponent />
    </PortfolioProvider>
  );
  expect(getByText('children')).toBeInTheDocument();
});

test('fetch portfolios from firebase', () => {
  const { getByText, queryByText, rerender } = render(
    <PortfolioProvider>
      <TestComponent />
    </PortfolioProvider>,
    { auth: { state: 'SIGNED_IN', currentUser: { uid: 'test-user' } as any } }
  );

  // Set up watcher with firestore
  expect(mockCollection).toHaveBeenCalledWith('/portfolios');
  expect(mockWhere).toHaveBeenCalledWith('user', '==', 'test-user');
  expect(mockRef.onSnapshot).toHaveBeenCalled();

  // Loading state
  expect(getByText('not loaded')).toBeInTheDocument();

  // Fake some portfolios
  act(() => {
    mockRef.onSnapshot.mock.calls[0][0]({
      docs: [{ data: () => ({ id: 'a' }) }, { data: () => ({ id: 'b' }) }],
    });
  });

  // Loading state and portfolios, but not yet selected a portfolio
  expect(getByText('loaded')).toBeInTheDocument();
  expect(getByText('a,b')).toBeInTheDocument();
  expect(queryByText('a')).toBeNull();

  // Pretend we've selected a portfolio
  rerender(
    <PortfolioProvider portfolioId="a">
      <TestComponent />
    </PortfolioProvider>
  );

  // And there it is
  expect(getByText('a')).toBeInTheDocument();

  // Selected portfolio is maintained
  rerender(
    <PortfolioProvider>
      <TestComponent />
    </PortfolioProvider>
  );
  expect(getByText('a')).toBeInTheDocument();
});
