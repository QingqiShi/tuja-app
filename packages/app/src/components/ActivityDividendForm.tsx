import React, { useState } from 'react';
import { GiReceiveMoney } from 'react-icons/gi';
import DateInput from './DateInput';
import CurrencyInput from './CurrencyInput';
import Select from './Select';
import Button from './Button';
import type { ActivityFormProps } from './ActivityForms';
import { ActionsContainer, Field, Label } from 'commonStyledComponents';
import useStocksList from 'hooks/useStocksList';
import { RiDeleteBinLine } from 'react-icons/ri';

function ActivityDividendForm({
  currency,
  initialActivity,
  onClose,
  onSubmit,
  onDelete,
}: ActivityFormProps) {
  const { stocksList } = useStocksList();
  const [date, setDate] = useState<Date>(initialActivity?.date ?? new Date());
  const [ticker, setTicker] = useState(
    (initialActivity?.type === 'Dividend' ? initialActivity.ticker : null) ?? ''
  );
  const [amount, setAmount] = useState(
    (initialActivity?.type === 'Dividend' ? initialActivity.amount : null) ?? 0
  );
  const [loading, setLoading] = useState(false);

  const availableStocks = stocksList.map((ticker) => ({
    label: ticker,
    value: ticker,
  }));

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
          if (onSubmit) {
            await onSubmit({ type: 'Dividend', date, ticker, amount });
          }
          setLoading(false);
          if (onClose) {
            onClose();
          }
        } catch {
          setLoading(false);
        }
      }}
    >
      <DateInput value={date} onChange={setDate} required />
      <Field>
        <Label>From Investment*</Label>
        <Select
          options={[
            {
              label: 'Select Investment',
              value: '',
            },
            ...availableStocks,
          ]}
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          required
        />
      </Field>
      <CurrencyInput
        label="Amount Received"
        value={amount}
        onChange={setAmount}
        currency={currency}
        required
      />
      <ActionsContainer>
        <Button
          variant="shout"
          startIcon={<GiReceiveMoney />}
          disabled={!date || !ticker || !amount || loading}
        >
          Dividend
        </Button>
        {initialActivity && (
          <Button
            type="button"
            variant="primary"
            icon={<RiDeleteBinLine />}
            onClick={async () => {
              setLoading(true);
              try {
                if (onDelete) {
                  await onDelete();
                }
                setLoading(false);
                if (onClose) {
                  onClose();
                }
              } catch {
                setLoading(false);
              }
            }}
          />
        )}
        <Button type="button" onClick={onClose}>
          Cancel
        </Button>
      </ActionsContainer>
    </form>
  );
}

export default ActivityDividendForm;
