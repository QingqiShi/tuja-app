import { render, waitFor, fireEvent } from '@testing-library/react';
import firebase from 'firebase/app';
import useAuth, { AuthProvider } from './useAuth';

const mockLogEvent = jest.fn();
const mockSetUserId = jest.fn();
const mockSignInWithPopup = jest.fn();
const mockSendSignInLinkToEmail = jest.fn();
const mockIsSignInWithEmailLink = jest.fn();
const mockSignInWithEmailLink = jest.fn();
jest.mock('firebase/app', () => ({
  analytics: () => ({ logEvent: mockLogEvent, setUserId: mockSetUserId }),
  auth: () => ({
    isSignInWithEmailLink: mockIsSignInWithEmailLink,
    onAuthStateChanged: () => {},
    signInWithPopup: mockSignInWithPopup,
    sendSignInLinkToEmail: mockSendSignInLinkToEmail,
    signInWithEmailLink: mockSignInWithEmailLink,
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

test('send sign in email', async () => {
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

test('sign in after clicking link from email', async () => {
  mockIsSignInWithEmailLink.mockReturnValue(true);
  mockSignInWithEmailLink.mockReturnValue({
    additionalUserInfo: { isNewUser: true },
  });
  const Component = () => {
    const { confirmEmail } = useAuth();
    return <button onClick={() => confirmEmail('test-email')}>sign in</button>;
  };
  const { getByText } = render(
    <AuthProvider>
      <Component />
    </AuthProvider>
  );
  fireEvent.click(getByText('sign in'));
  await waitFor(() => {});
  expect(mockSignInWithEmailLink).toHaveBeenCalledWith(
    'test-email',
    'http://localhost/'
  );
});

test('reset error', async () => {
  mockSignInWithPopup.mockImplementation(async () => {
    throw new Error('test error');
  });
  const Component = () => {
    const { signInWithGithub, reset, authError } = useAuth();
    return (
      <div>
        <div>{authError}</div>
        <button onClick={signInWithGithub}>sign in</button>
        <button onClick={reset}>reset error</button>
      </div>
    );
  };
  const { getByText, queryByText } = render(
    <AuthProvider>
      <Component />
    </AuthProvider>
  );
  fireEvent.click(getByText('sign in'));
  await waitFor(() => {});
  expect(getByText('test error')).toBeInTheDocument();

  fireEvent.click(getByText('reset error'));
  expect(queryByText('test error')).toBeNull();
});
