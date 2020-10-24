import React from 'react';
import { Story, Meta } from '@storybook/react';
import Select from '../../components/Select';

export default {
  title: 'Inputs/Select',
  component: Select,
} as Meta;

const options = [
  { label: 'Select...', value: '' },
  { label: 'Apple', value: 'apple' },
  { label: 'Orange', value: 'orange' },
];

const Template: Story<React.ComponentProps<typeof Select>> = (args) => (
  <Select {...args} />
);

export const Demo = Template.bind({});
Demo.args = {
  label: 'Fruits',
  options,
  helperText: 'Select your favourite fruit.',
  required: false,
};

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: 'Fruits',
  options,
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  options,
  helperText: 'Select your favourite fruit.',
};

export const Disabled = Template.bind({});
Disabled.args = {
  options,
  value: 'orange',
  disabled: true,
};

export const Required = Template.bind({});
Required.args = {
  label: 'Fruits',
  options,
  required: true,
};
