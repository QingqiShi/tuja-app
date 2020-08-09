import React from 'react';
import { withKnobs, select } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import SignIn from 'components/SignIn';
import { AuthContext } from 'hooks/useAuth';

const SignInStories = {
  title: 'Contents|SignIn',
  component: SignIn,
  decorators: [withKnobs],
};

export default SignInStories;

const getAuth = () => ({
  signIn: async (email: string) => action('sign in')(email),
  signOut: action('sign out'),
  confirmEmail: action('confirm email'),
  reset: action('reset'),
  currentUser: null,
  isAdmin: false,
});

export const Demo = () => (
  <AuthContext.Provider
    value={{
      ...getAuth(),
      state: select(
        'Sign in state',
        {
          SignedOut: 'SIGNED_OUT',
          SignedIn: 'SIGNED_IN',
          EmailSent: 'EMAIL_SENT',
          ConfirmEmail: 'CONFIRM_EMAIL',
          SigningIn: 'SIGNING_IN',
        },
        'SIGNED_OUT'
      ),
    }}
  >
    <SignIn />
  </AuthContext.Provider>
);

export const SignedOut = () => (
  <AuthContext.Provider value={{ ...getAuth(), state: 'SIGNED_OUT' }}>
    <SignIn />
  </AuthContext.Provider>
);

export const EmailSent = () => (
  <AuthContext.Provider value={{ ...getAuth(), state: 'EMAIL_SENT' }}>
    <SignIn />
  </AuthContext.Provider>
);

export const ConfirmEmail = () => (
  <AuthContext.Provider value={{ ...getAuth(), state: 'CONFIRM_EMAIL' }}>
    <SignIn />
  </AuthContext.Provider>
);

export const SigningIn = () => (
  <AuthContext.Provider value={{ ...getAuth(), state: 'SIGNING_IN' }}>
    <SignIn />
  </AuthContext.Provider>
);
