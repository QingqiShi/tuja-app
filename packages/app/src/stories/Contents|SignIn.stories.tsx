import React from 'react';
import { action } from '@storybook/addon-actions';
import SignIn from 'components/SignIn';
import { AuthContext } from 'hooks/useAuth';

const SignInStories = {
  title: 'Contents/SignIn',
  component: SignIn,
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

export const Demo = ({ state }: any) => (
  <AuthContext.Provider
    value={{
      ...getAuth(),
      state,
    }}
  >
    <SignIn />
  </AuthContext.Provider>
);
Demo.args = {
  state: 'SIGNED_OUT',
};
Demo.argTypes = {
  state: {
    control: {
      type: 'radio',
      options: [
        'SIGNED_OUT',
        'SIGNED_IN',
        'EMAIL_SENT',
        'CONFIRM_EMAIL',
        'SIGNING_IN',
      ],
    },
  },
};

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
