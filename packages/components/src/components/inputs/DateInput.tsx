import dayjs from 'dayjs';
import TextInput from './TextInput';
import FormattedInput from './FormattedInput';

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
  value?: Date;
  onChange?: (newDate: Date) => void;
}

function DateInput({
  label,
  value,
  onChange,
  onBlur,
  ...props
}: DateInputProps) {
  const extendedLabel = label
    ? `${label}${!isDateSupported ? ` (${DATE_FORMAT})` : ''}`
    : undefined;

  return (
    <FormattedInput
      {...props}
      type="date"
      max="9999-12-31"
      placeholder={DATE_FORMAT}
      label={extendedLabel}
      value={value}
      onChange={onChange}
      format={(val) => dayjs(val).format(DATE_FORMAT)}
      parse={(raw) => {
        const parsed = dayjs(raw, DATE_FORMAT);
        if (!parsed.isValid()) return null;
        return parsed.toDate();
      }}
    />
  );
}

export default DateInput;
