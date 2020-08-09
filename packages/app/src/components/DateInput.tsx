import React, { useState, forwardRef } from 'react';
import dayjs from 'dayjs';
import TextInput from './TextInput';

function checkDateSupported() {
  var input = document.createElement('input');
  var value = 'a';
  input.setAttribute('type', 'date');
  input.setAttribute('value', value);
  return input.value !== value;
}
const isDateSupported = checkDateSupported();

interface DateInputProps
  extends Omit<
    React.ComponentProps<typeof TextInput>,
    'value' | 'defaultValue' | 'onChange' | 'ref'
  > {
  defaultValue?: Date;
  onChange?: (newDate: Date) => void;
}

function DateInput(
  { label, defaultValue, onChange, onBlur, ...props }: DateInputProps,
  ref: React.Ref<HTMLInputElement>
) {
  const [internalDate, setInternalDate] = useState(defaultValue ?? new Date());
  const [val, setVal] = useState(
    defaultValue ?? internalDate
      ? dayjs(defaultValue ?? internalDate).format('YYYY-MM-DD')
      : ''
  );

  const extendedLabel = label
    ? `${label}${!isDateSupported ? ' (yyyy/mm/dd)' : ''}`
    : undefined;

  return (
    <TextInput
      {...props}
      type="date"
      placeholder="yyyy/mm/dd"
      max="9999-12-31"
      label={extendedLabel}
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        const parsed = dayjs(e.target.value, 'YYYY-MM-DD');
        if (parsed.isValid()) {
          setInternalDate(parsed.toDate());
          if (onChange) {
            onChange(parsed.toDate());
          }
        }
      }}
      onBlur={(e) => {
        const parsed = dayjs(val, 'YYYY-MM-DD');
        if (!parsed.isValid()) {
          setVal(dayjs(parsed).format('YYYY-MM-DD'));
        } else {
          setVal(dayjs(internalDate).format('YYYY-MM-DD'));
        }
        if (onBlur) {
          onBlur(e);
        }
      }}
      ref={ref}
    />
  );
}

export default forwardRef(DateInput);
