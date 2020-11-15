import React from 'react';
import { Story, Meta } from '@storybook/react';
import ButtonGroup from './ButtonGroup';

export default {
  title: 'Inputs/ButtonGroup',
  component: ButtonGroup,
  argTypes: {
    value: {
      control: { type: 'text' },
    },
  },
} as Meta;

const Template: Story<React.ComponentProps<typeof ButtonGroup>> = (args) => (
  <ButtonGroup {...args} />
);

export const Default = Template.bind({});
Default.args = {
  value: '3M',
  buttons: [
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '1Y', value: '1Y' },
  ],
};
