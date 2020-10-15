import React, { useState, useEffect } from 'react';
import TextInput from './TextInput';
import { formatCurrency, parseCurrency } from 'libs/forex';

type BaseProps = Omit<
  React.ComponentProps<typeof TextInput>,
  'value' | 'onChange'
>;

interface CurrencyInputProps extends BaseProps {
  currency: string;
  value?: number;
  onChange?: (num: number) => void;
}

function CurrencyInput({
  currency,
  value,
  onChange,
  onBlur,
  onFocus,
  ...props
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [internalVal, setInternalVal] = useState(value ?? 0);
  const [inputValue, setInputValue] = useState(
    formatCurrency(currency, value ?? internalVal)
  );

  useEffect(() => {
    if (!isFocused) {
      const formatted = formatCurrency(currency, value ?? internalVal);
      if (formatted !== inputValue) {
        setInputValue(formatted);
      }
    }
  }, [currency, inputValue, internalVal, isFocused, value]);

  return (
    <TextInput
      {...props}
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        const parsed = parseCurrency(currency, e.target.value);
        if (!isNaN(parsed)) {
          if (!value) {
            setInternalVal(parsed);
          }
          if (onChange) {
            onChange(parsed);
          }
        }
      }}
      onFocus={(e) => {
        setIsFocused(true);
        if (onFocus) {
          onFocus(e);
        }
      }}
      onBlur={(e) => {
        setIsFocused(false);
        const parsed = parseCurrency(currency, inputValue || '0');
        if (!isNaN(parsed)) {
          setInputValue(formatCurrency(currency, parsed));
        } else {
          setInputValue(formatCurrency(currency, value ?? internalVal));
        }
        if (onBlur) {
          onBlur(e);
        }
      }}
      inputMode="decimal"
    />
  );
}

export default CurrencyInput;
