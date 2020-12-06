import { useState, useEffect } from 'react';
import TextInput from './TextInput';

type BaseProps = Omit<
  React.ComponentProps<typeof TextInput>,
  'value' | 'onChange'
>;

interface CurrencyInputProps<T> extends BaseProps {
  value?: T;
  onChange?: (num: T) => void;
  format?: (val: T) => string;
  parse?: (raw: string) => T | null;
}

function FormattedInput<T>({
  value,
  format,
  parse,
  onChange,
  onBlur,
  onFocus,
  ...props
}: CurrencyInputProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const [internalVal, setInternalVal] = useState(value);
  const [inputValue, setInputValue] = useState(
    (format && value && format(value)) ||
      (typeof value === 'string' && value) ||
      ''
  );

  // Update input value based on value prop
  useEffect(() => {
    if (!isFocused && format && typeof value !== 'undefined') {
      const formatted = format(value);
      if (formatted !== inputValue) {
        setInputValue(formatted);
      }
    }
  }, [format, inputValue, isFocused, value]);

  return (
    <TextInput
      {...props}
      value={inputValue}
      onChange={(e) => {
        setInputValue(e.target.value);
        if (parse) {
          const parsed = parse(e.target.value);
          if (parsed !== null) {
            if (typeof value === 'undefined') {
              setInternalVal(parsed);
            }
            if (onChange) {
              onChange(parsed);
            }
          }
        }
      }}
      onFocus={(e) => {
        setIsFocused(true);
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        if (parse && format) {
          const parsed = parse(inputValue);
          const externalValue = value ?? internalVal;
          if (parsed !== null) {
            setInputValue(format(parsed));
          } else if (typeof externalValue !== 'undefined') {
            setInputValue(format(externalValue));
          }
        }
        if (onBlur) onBlur(e);
      }}
      inputMode="decimal"
    />
  );
}

export default FormattedInput;
