import { Route } from 'react-router-dom';
import { openDB } from 'idb-latest';
import { fireEvent, waitFor } from '@testing-library/react';
import { render } from '../testUtils';
import SettingsList from './SettingsList';

const mockClear = jest.fn(async () => {});
const mockReload = jest.fn();

jest.mock('idb-latest');
const { location } = window;

beforeEach(() => {
  // Mock idb clear
  mockClear.mockReturnValue(Promise.resolve());
  (openDB as jest.Mock).mockReturnValue({
    transaction: () => ({ objectStore: () => ({ clear: mockClear }) }),
  });

  // Mock page reload
  delete (window as any).location;
  window.location = { ...location, reload: mockReload };
});

afterEach(() => {
  window.location = location;
});

test('render settings options', () => {
  const { getByText } = render(<SettingsList />, {
    auth: { state: 'SIGNED_IN' },
    initialRoute: '/portfolio',
  });

  expect(getByText('Create portfolio')).toBeInTheDocument();
  expect(getByText('Clear cache')).toBeInTheDocument();
  expect(getByText('Sign out')).toBeInTheDocument();
});

test('option to create portfolio', () => {
  const { getByText, queryByText } = render(
    <Route path="/portfolio">
      <SettingsList />
    </Route>,
    { auth: { state: 'SIGNED_IN' }, initialRoute: '/portfolio' }
  );

  expect(getByText('Settings')).toBeInTheDocument();

  fireEvent.click(getByText('Create portfolio'));
  expect(queryByText('Settings')).toBeNull();
});

test('option to clear cache', async () => {
  const { getByText } = render(<SettingsList />);

  fireEvent.click(getByText('Clear cache'));
  await waitFor(() => {
    expect(mockClear).toHaveBeenCalledTimes(3);
  });

  expect(mockReload).toHaveBeenCalled();
});

test('option to sign out', async () => {
  const mockSignOut = jest.fn();

  const { getByText } = render(<SettingsList />, {
    auth: { state: 'SIGNED_IN', signOut: mockSignOut },
  });

  fireEvent.click(getByText('Sign out'));
  expect(mockSignOut).toHaveBeenCalled();
});

test('hide options for signed out users', () => {
  const { queryByText } = render(<SettingsList />);

  expect(queryByText('Create portfolio')).toBeNull();
  expect(queryByText('Sign out')).toBeNull();
});
