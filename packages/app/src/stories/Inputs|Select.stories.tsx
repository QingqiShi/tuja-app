import React from 'react';
import styled from 'styled-components/macro';
import { action } from '@storybook/addon-actions';
import Select from 'components/Select';

const Container = styled.div`
  width: 300px;
`;

const SelectStories = {
  title: 'Inputs/Select',
  component: Select,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export default SelectStories;

const options = [
  { label: 'Select...', value: '' },
  { label: 'Apple', value: 'apple' },
  { label: 'Orange', value: 'orange' },
];

export const Demo = (args: any) => (
  <Select onChange={action('select-change')} options={options} {...args} />
);
Demo.args = {
  label: 'Fruits',
  helperText: 'Select your favourite fruit.',
  required: false,
};

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
