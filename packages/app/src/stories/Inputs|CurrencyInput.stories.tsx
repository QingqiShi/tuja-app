import React from 'react';
import styled from 'styled-components/macro';
import { action } from '@storybook/addon-actions';
import { withKnobs, text, number } from '@storybook/addon-knobs';
import CurrencyInput from 'components/CurrencyInput';

const Container = styled.div`
  width: 300px;
`;

const CurrencyInputStories = {
  title: 'Inputs|CurrencyInput',
  component: CurrencyInput,
  decorators: [withKnobs, (storyFn: any) => <Container>{storyFn()}</Container>],
};

export default CurrencyInputStories;

export const Demo = () => (
  <CurrencyInput
    label="Amount"
    currency={text('Currency', 'GBP')}
    onChange={action('onChange')}
  />
);

export const ExternalValue = () => (
  <CurrencyInput
    value={number('value', 12345)}
    currency={text('Currency', 'GBP')}
  />
);
