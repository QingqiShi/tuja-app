import { fireEvent } from '@testing-library/react';
import { render } from 'testUtils';
import NavBar from './NavBar';

test('render logo', async () => {
  const { getByText } = render(<NavBar />, {
    initialRoute: '/',
  });
  expect(getByText('Tuja')).toBeInTheDocument();
});

test('render sign in button', () => {
  const { getByText } = render(<NavBar />, {
    initialRoute: '/',
  });
  expect(getByText('Sign in')).toBeInTheDocument();
  fireEvent.click(getByText('Sign in'));
  expect(window.location.pathname).toBe('/signin');
});

test('render sign out button', () => {
  const mockSignOut = jest.fn();
  const { getByText, queryByText, getByTestId } = render(<NavBar />, {
    initialRoute: '/',
    auth: { state: 'SIGNED_IN', signOut: mockSignOut },
  });
  expect(queryByText('Sign in')).toBeNull();

  fireEvent.click(getByTestId('top-bar-menu'));
  fireEvent.click(getByText('Sign out'));
  expect(mockSignOut).toHaveBeenCalled();
});

test('given no portfolio then hide set benchmark button', () => {
  const { queryByText, getByTestId } = render(<NavBar />, {
    initialRoute: '/',
    auth: { state: 'SIGNED_IN' },
    portfolio: { portfolio: null },
  });

  fireEvent.click(getByTestId('top-bar-menu'));
  expect(queryByText('Set benchmark')).toBeNull();
});

test('given portfolio render set benchmark button', () => {
  const { getByText, getByTestId } = render(<NavBar />, {
    initialRoute: '/',
    auth: { state: 'SIGNED_IN' },
  });

  fireEvent.click(getByTestId('top-bar-menu'));
  fireEvent.click(getByText('Set benchmark'));

  expect(getByText('Portfolio Benchmark')).toBeInTheDocument();
});
