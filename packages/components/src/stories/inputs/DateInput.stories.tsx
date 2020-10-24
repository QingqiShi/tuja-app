import React from 'react';
import { Story, Meta } from '@storybook/react';
import DateInput from '../../components/DateInput';

export default {
  title: 'Inputs/DateInput',
  component: DateInput,
} as Meta;

const Template: Story<React.ComponentProps<typeof DateInput>> = (args) => (
  <DateInput {...args} />
);

export const Default = Template.bind({});
Default.args = {};

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: 'Date',
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  helperText: 'Some helper text.',
};

export const Required = Template.bind({});
Required.args = {
  label: 'Date',
  required: true,
};
