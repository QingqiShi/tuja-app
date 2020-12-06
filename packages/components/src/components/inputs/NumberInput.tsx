import FormattedInput from './FormattedInput';

interface NumberInputProps
  extends Omit<
    React.ComponentProps<typeof FormattedInput>,
    'value' | 'onChange' | 'format' | 'parse' | 'inputMode'
  > {
  value?: number;
  onChange?: (val: number) => void;
}

function NumberInput(props: NumberInputProps) {
  return (
    <FormattedInput
      format={(val) => val.toString()}
      parse={(raw) => {
        const parsed = parseFloat(raw);
        if (isNaN(parsed)) return null;
        return parsed;
      }}
      inputMode="decimal"
      {...props}
    />
  );
}

export default NumberInput;
