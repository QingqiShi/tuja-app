import React from 'react';
import { Story, Meta } from '@storybook/react';
import TextInput from './TextInput';

export default {
  title: 'Inputs/TextInput',
  component: TextInput,
  argTypes: {
    type: {
      control: { type: 'select', options: ['email', 'password', 'text'] },
    },
  },
} as Meta;

const Template: Story<React.ComponentProps<typeof TextInput>> = (args) => (
  <TextInput {...args} />
);

export const Demo = Template.bind({});
Demo.args = {
  label: 'Email',
  placeholder: 'hi@example.com',
  helperText: 'We will never share your email address.',
  type: 'email',
  required: false,
};

export const WithPlaceholder = Template.bind({});
WithPlaceholder.args = {
  placeholder: 'Email',
  type: 'email',
};

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: 'Email',
  type: 'email',
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  helperText: 'Some helper text.',
  type: 'email',
};

export const Disabled = Template.bind({});
Disabled.args = {
  value: 'qingqishi@live.com',
  disabled: true,
};

export const Required = Template.bind({});
Required.args = {
  label: 'Email',
  required: true,
};

export const Invalid = Template.bind({});
Invalid.args = {
  type: 'email',
  label: 'Email',
  defaultValue: 'testtest',
};
