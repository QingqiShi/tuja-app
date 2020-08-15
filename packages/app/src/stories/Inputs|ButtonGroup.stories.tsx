import React from 'react';
import { action } from '@storybook/addon-actions';
import ButtonGroup from 'components/ButtonGroup';

const ButtonGroupStories = {
  title: 'Inputs/ButtonGroup',
  component: ButtonGroup,
  argTypes: {
    value: {
      control: { type: 'text' },
    },
  },
};

export default ButtonGroupStories;

export const Demo = (args: any) => (
  <ButtonGroup {...args} onChange={action('onChange')} />
);
Demo.args = {
  value: '3M',
  buttons: [
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '3M', value: '3M' },
    { label: '1Y', value: '1Y' },
  ],
};
