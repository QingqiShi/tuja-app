import React from 'react';
import styled from 'styled-components/macro';
import { action } from '@storybook/addon-actions';
import CurrencyInput from 'components/CurrencyInput';

const Container = styled.div`
  width: 300px;
`;

const CurrencyInputStories = {
  title: 'Inputs/CurrencyInput',
  component: CurrencyInput,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: {
    currency: {
      control: { type: 'inline-radio', options: ['GBP', 'USD'] },
    },
  },
};

export default CurrencyInputStories;

export const Demo = (args: any) => (
  <CurrencyInput {...args} onChange={action('onChange')} />
);
Demo.args = {
  currency: 'GBP',
  label: 'Amount',
};

export const ExternalValue = (args: any) => <CurrencyInput {...args} />;

ExternalValue.args = {
  currency: 'GBP',
  value: 12345,
};
