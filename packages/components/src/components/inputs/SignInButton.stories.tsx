import { Story, Meta } from '@storybook/react';
import { MdEmail } from 'react-icons/md';
import { FaApple } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import SignInButton from './SignInButton';

export default {
  title: 'Inputs/SignInButton',
  component: SignInButton,
} as Meta;

const Template: Story<React.ComponentProps<typeof SignInButton>> = (args) => (
  <SignInButton {...args} />
);

export const EmailSignIn = Template.bind({});
EmailSignIn.args = {
  children: 'Sign in with email',
  icon: <MdEmail />,
  bgColor: '#db4437',
};

export const AppleSignIn = Template.bind({});
AppleSignIn.args = {
  children: 'Sign in with Apple',
  icon: <FaApple />,
  bgColor: '#000000',
};

export const GithubSignIn = Template.bind({});
GithubSignIn.args = {
  children: 'Sign in with Google',
  icon: <FcGoogle />,
  bgColor: '#4285F4',
  iconBgColor: '#fff',
};
