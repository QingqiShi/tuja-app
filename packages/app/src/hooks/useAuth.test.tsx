import { render, waitFor, fireEvent } from '@testing-library/react';
import firebase from 'firebase/app';
import useAuth, { AuthProvider } from './useAuth';

const mockLogEvent = jest.fn();
const mockSetUserId = jest.fn();
const mockSignInWithPopup = jest.fn();
const mockSendSignInLinkToEmail = jest.fn();
jest.mock('firebase/app', () => ({
  analytics: () => ({ logEvent: mockLogEvent, setUserId: mockSetUserId }),
  auth: () => ({
    isSignInWithEmailLink: () => false,
    onAuthStateChanged: () => {},
    signInWithPopup: mockSignInWithPopup,
    sendSignInLinkToEmail: mockSendSignInLinkToEmail,
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

test('sign in with google', async () => {
  mockSignInWithPopup.mockReturnValue({ additionalUserInfo: {} });
  const Component = () => {
    const { signInWithGoogle } = useAuth();
    return <button onClick={signInWithGoogle}>sign in</button>;
  };
  const { getByText } = render(
    <AuthProvider>
      <Component />
    </AuthProvider>
  );
  fireEvent.click(getByText('sign in'));
  await waitFor(() => {});
  expect(mockSignInWithPopup).toHaveBeenCalled();
});

test('sign in with github', async () => {
  mockSignInWithPopup.mockReturnValue({ additionalUserInfo: {} });
  const Component = () => {
    const { signInWithGithub } = useAuth();
    return <button onClick={signInWithGithub}>sign in</button>;
  };
  const { getByText } = render(
    <AuthProvider>
      <Component />
    </AuthProvider>
  );
  fireEvent.click(getByText('sign in'));
  await waitFor(() => {});
  expect(mockSignInWithPopup).toHaveBeenCalled();
});

test('sign in with email', async () => {
  const Component = () => {
    const { signIn } = useAuth();
    return <button onClick={() => signIn('test-email')}>sign in</button>;
  };
  const { getByText } = render(
    <AuthProvider>
      <Component />
    </AuthProvider>
  );
  fireEvent.click(getByText('sign in'));
  await waitFor(() => {});
  expect(mockSendSignInLinkToEmail).toHaveBeenCalledWith('test-email', {
    url: 'http://localhost/',
    handleCodeInApp: true,
  });
});
