import React, { useState } from 'react';
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
  extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'ref'> {
  value?: Date;
  onChange?: (newDate: Date) => void;
}

function DateInput({ value, onChange, ...props }: DateInputProps) {
  const [val, setVal] = useState(
    value ? dayjs(value).format('YYYY-MM-DD') : ''
  );
  return (
    <TextInput
      {...props}
      type="date"
      label={`Date${!isDateSupported ? ' (yyyy/mm/dd)' : ''}`}
      placeholder="yyyy/mm/dd"
      value={val}
      onChange={(e) => {
        setVal(e.target.value);
        const parsed = dayjs(e.target.value, 'YYYY-MM-DD');
        if (onChange && parsed.isValid()) {
          onChange(parsed.toDate());
        }
      }}
      onBlur={() => {
        const parsed = dayjs(val, 'YYYY-MM-DD');
        if (!parsed.isValid() && value) {
          setVal(dayjs(value).format('YYYY-MM-DD'));
        }
      }}
    />
  );
}

export default DateInput;
