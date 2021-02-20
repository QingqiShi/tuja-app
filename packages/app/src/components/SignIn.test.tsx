import { fireEvent, waitFor } from '@testing-library/react';
import { render } from 'testUtils';
import SignIn from './SignIn';

test('render', async () => {
  const mockSignInWithGoogle = jest.fn();
  const mockSignInWithGithub = jest.fn();
  const { getByText } = render(<SignIn />, {
    auth: {
      signInWithGoogle: mockSignInWithGoogle,
      signInWithGithub: mockSignInWithGithub,
    },
  });
  expect(getByText('Sign in with Email')).toBeInTheDocument();
  expect(getByText('Sign in with Google')).toBeInTheDocument();

  fireEvent.click(getByText('Sign in with Google'));
  await waitFor(() => {});
  expect(mockSignInWithGoogle).toHaveBeenCalled();

  fireEvent.click(getByText('Sign in with Github'));
  await waitFor(() => {});
  expect(mockSignInWithGithub).toHaveBeenCalled();
});

test('email sign in error', async () => {
  const mockReset = jest.fn();
  const { getByText } = render(<SignIn />, {
    auth: {
      state: 'SIGNING_IN',
      authError: 'Expired',
      reset: mockReset,
    },
    initialRoute: '/demo?signingin',
  });
  expect(getByText('Signing in...')).toBeInTheDocument();
  expect(getByText('Expired')).toBeInTheDocument();

  fireEvent.click(getByText('Start again'));
  expect(mockReset).toHaveBeenCalled();
});
