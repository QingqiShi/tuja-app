import { FormattedInput } from '@tuja/components';
import { formatCurrency, parseCurrency } from '@tuja/forex';

interface CurrencyInputProps
  extends Omit<
    React.ComponentProps<typeof FormattedInput>,
    'value' | 'onChange' | 'format' | 'parse'
  > {
  currency: string;
  value?: number;
  onChange?: (val: number) => void;
}

function CurrencyInput({
  currency,
  value,
  onChange,
  ...rest
}: CurrencyInputProps) {
  return (
    <FormattedInput
      value={value}
      onChange={onChange}
      format={(val) => formatCurrency(currency, val)}
      parse={(raw) => {
        const parsed = parseCurrency(currency, raw);
        if (isNaN(parsed)) return null;
        return parsed;
      }}
      {...rest}
    />
  );
}

export default CurrencyInput;
