import React from 'react';
import { Story, Meta } from '@storybook/react';
import { FaUserCircle } from 'react-icons/fa';
import { RiSendPlane2Line, RiHomeLine } from 'react-icons/ri';
import Button from '../components/Button';

export default {
  title: 'Inputs/Button',
  component: Button,
} as Meta;

const Template: Story<React.ComponentProps<typeof Button>> = (args) => (
  <Button {...args} />
);

export const Default = Template.bind({});
Default.args = {
  children: 'Default',
};

export const Primary = Template.bind({});
Primary.args = {
  variant: 'primary',
  children: 'Primary',
};

export const Outline = Template.bind({});
Outline.args = {
  variant: 'outline',
  children: 'Outline',
};

export const Shout = Template.bind({});
Shout.args = {
  variant: 'shout',
  children: 'Shout',
};

export const StartIcon = Template.bind({});
StartIcon.args = {
  startIcon: <FaUserCircle />,
  children: 'log in',
};

export const EndIcon = Template.bind({});
EndIcon.args = {
  endIcon: <RiSendPlane2Line />,
  children: 'send',
};

export const Icon = Template.bind({});
Icon.args = {
  icon: <RiHomeLine />,
};
