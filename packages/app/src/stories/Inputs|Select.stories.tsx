import React from 'react';
import styled from 'styled-components/macro';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import Select from 'components/Select';

const Container = styled.div`
  width: 300px;
`;

const SelectStories = {
  title: 'Inputs|Select',
  component: Select,
  decorators: [withKnobs, (storyFn: any) => <Container>{storyFn()}</Container>],
};

export default SelectStories;

const options = [
  { label: 'Select...', value: '' },
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
