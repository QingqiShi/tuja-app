import React from 'react';
import { Story, Meta } from '@storybook/react';
import NumberInput from '../../components/NumberInput';

export default {
  title: 'Inputs/NumberInput',
  component: NumberInput,
} as Meta;

const Template: Story<React.ComponentProps<typeof NumberInput>> = (args) => (
  <NumberInput {...args} />
);

export const FormatsNumber = Template.bind({});
FormatsNumber.args = {
  label: 'Number',
};

export const Controlled = Template.bind({});
Controlled.args = {
  label: 'Number',
  value: 12345,
};
