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
