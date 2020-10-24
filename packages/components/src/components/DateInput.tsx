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

const DATE_FORMAT = 'YYYY-MM-DD';

interface DateInputProps
  extends Omit<
    React.ComponentProps<typeof TextInput>,
    'value' | 'defaultValue' | 'onChange' | 'ref'
  > {
  defaultValue?: Date;
  onChange?: (newDate: Date) => void;
}

function DateInput({
  label,
  defaultValue,
  onChange,
  onBlur,
  ...props
}: DateInputProps) {
  const [internalDate, setInternalDate] = useState(defaultValue ?? new Date());
  const [val, setVal] = useState(
    defaultValue ?? internalDate
      ? dayjs(defaultValue ?? internalDate).format(DATE_FORMAT)
      : ''
  );

  const extendedLabel = label
    ? `${label}${!isDateSupported ? ` (${DATE_FORMAT})` : ''}`
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
        const parsed = dayjs(e.target.value, DATE_FORMAT);
        if (parsed.isValid()) {
          setInternalDate(parsed.toDate());
          if (onChange) {
            onChange(parsed.toDate());
          }
        }
      }}
      onBlur={(e) => {
        const parsed = dayjs(val, DATE_FORMAT);
        if (!parsed.isValid()) {
          setVal(dayjs(parsed).format(DATE_FORMAT));
        } else {
          setVal(dayjs(internalDate).format(DATE_FORMAT));
        }
        if (onBlur) {
          onBlur(e);
        }
      }}
    />
  );
}

export default DateInput;
