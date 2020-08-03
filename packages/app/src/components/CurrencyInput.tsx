import React, { useState } from 'react';
import TextInput from './TextInput';
import { formatCurrency, parseCurrency } from 'libs/stocksClient';

interface CurrencyInputProps
  extends Omit<React.ComponentProps<typeof TextInput>, 'value' | 'onChange'> {
  currency: string;
  value: number;
  onChange: (num: number) => void;
}

function CurrencyInput({
  currency,
  value,
  onChange,
  ...props
}: CurrencyInputProps) {
  const [inputValue, setInputValue] = useState(formatCurrency(currency, value));

  return (
    <TextInput
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
      }}
      onBlur={() => {
        const parsed = parseCurrency(currency, inputValue || '0');
        if (!isNaN(parsed)) {
          onChange(parsed);
        }
        setInputValue(formatCurrency(currency, parsed));
      }}
      inputMode="decimal"
      {...props}
    />
  );
}

export default CurrencyInput;
