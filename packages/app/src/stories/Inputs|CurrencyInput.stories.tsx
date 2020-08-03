import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { withKnobs, text } from '@storybook/addon-knobs';
import CurrencyInput from 'components/CurrencyInput';

const Container = styled.div`
  width: 300px;
`;

export default {
  title: 'Inputs|CurrencyInput',
  component: CurrencyInput,
  decorators: [withKnobs, (storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Demo = () => {
  const [value, setValue] = useState(0);
  return (
    <CurrencyInput
      label="Amount"
      currency={text('Currency', 'GBP')}
      value={value}
      onChange={setValue}
    />
  );
};
