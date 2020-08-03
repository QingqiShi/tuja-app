import React from 'react';
import { withKnobs, select, boolean, text } from '@storybook/addon-knobs';
import { action } from '@storybook/addon-actions';
import Select from 'components/Select';

export default {
  title: 'Inputs|Select',
  component: Select,
};

const options = [
  { label: 'Select', value: '' },
  { label: 'Apple', value: 'apple' },
  { label: 'Orange', value: 'orange' },
];

export const Demo = () => (
  <Select
    onChange={action('select-change')}
    label={text('Label', 'Fruits') || undefined}
    helperText={
      text('Helper Text', 'Select your favourite fruit.') || undefined
    }
    required={boolean('Required', true)}
    options={options}
  />
);

export const WithLabel = () => (
  <Select label="Fruits" options={options} onChange={action('select-change')} />
);

export const WithHelperText = () => (
  <Select
    helperText="Some helper text."
    options={options}
    onChange={action('select-change')}
  />
);

export const Disabled = () => (
  <Select
    value="orange"
    options={options}
    onChange={action('select-change')}
    disabled
  />
);

export const Required = () => (
  <Select
    label="Email"
    options={options}
    onChange={action('select-change')}
    required
  />
);
