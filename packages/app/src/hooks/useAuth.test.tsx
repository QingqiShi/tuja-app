import { act, render, waitFor, fireEvent } from '@testing-library/react';
import firebase from 'firebase/app';
import useAuth, { AuthProvider } from './useAuth';

const mockLogEvent = jest.fn();
const mockSignOut = jest.fn();
const mockOnAuthStateChanged = jest.fn();
jest.mock('firebase/app', () => ({
  analytics: () => ({ logEvent: mockLogEvent }),
  auth: () => ({
    onAuthStateChanged: mockOnAuthStateChanged,
    signOut: mockSignOut,
  }),
}));

beforeAll(() => {
  class X {}
  firebase.auth.GoogleAuthProvider = X as any;
  firebase.auth.GithubAuthProvider = X as any;
});

test('render provider', async () => {
  const { getByText } = render(<AuthProvider>test</AuthProvider>);
  expect(getByText('test')).toBeInTheDocument();
});

test('detect auth state changes', async () => {
  const Component = () => {
    const { currentUser } = useAuth();
    return <div>{currentUser?.email}</div>;
  };
  const { getByText } = render(
    <AuthProvider>
      <Component />
    </AuthProvider>
  );

  expect(mockOnAuthStateChanged).toHaveBeenCalled();
  const handler = mockOnAuthStateChanged.mock.calls[0][0];

  const mockUser = {
    email: 'test@email.com',
    getIdTokenResult: async () => undefined,
  };
  await act(async () => {
    await handler(mockUser);
  });

  expect(getByText('test@email.com')).toBeInTheDocument();
});

test('sign out', async () => {
  const Component = () => {
    const { signOut } = useAuth();
    return <button onClick={signOut}>sign out</button>;
  };
  const { getByText } = render(
    <AuthProvider>
      <Component />
    </AuthProvider>
  );
  fireEvent.click(getByText('sign out'));
  await waitFor(() => {});
  expect(mockSignOut).toHaveBeenCalled();
});
