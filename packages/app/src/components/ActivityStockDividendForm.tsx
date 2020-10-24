import React, { useState } from 'react';
import { GiReceiveMoney } from 'react-icons/gi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { v4 as uuid } from 'uuid';
import { Button, Select, TextInput } from '@tuja/components';
import DateInput from './DateInput';
import { ActionsContainer, Field, Label } from 'commonStyledComponents';
import usePortfolio from 'hooks/usePortfolio';
import type { ActivityFormProps } from 'libs/activities';

function ActivityStockDividendForm({
  initialActivity,
  onClose,
  onSubmit,
  onDelete,
}: ActivityFormProps) {
  const { portfolio } = usePortfolio();
  const [date, setDate] = useState<Date>(initialActivity?.date ?? new Date());
  const [ticker, setTicker] = useState(
    (initialActivity?.type === 'StockDividend'
      ? initialActivity.ticker
      : null) ?? ''
  );
  const [units, setUnits] = useState(
    (initialActivity?.type === 'StockDividend'
      ? initialActivity.units
      : null) ?? 0
  );
  const [unitsRaw, setUnitsRaw] = useState(
    (initialActivity?.type === 'StockDividend'
      ? initialActivity.units?.toString()
      : null) ?? '0'
  );
  const [loading, setLoading] = useState(false);

  const availableStocks =
    portfolio?.tickers.map((ticker) => ({
      label: ticker,
      value: ticker,
    })) ?? [];

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
          if (onSubmit) {
            await onSubmit({
              id: initialActivity?.id ?? uuid(),
              type: 'StockDividend',
              date,
              ticker,
              units,
            });
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
      <DateInput label="Date" defaultValue={date} onChange={setDate} required />
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
      <TextInput
        label="Number of Shares Received"
        value={unitsRaw}
        onChange={(e) => {
          const val = e.target.value;
          setUnitsRaw(val);

          const parsed = parseFloat(unitsRaw);
          if (!isNaN(parsed)) {
            setUnits(parsed);
          }
        }}
        onBlur={() => {
          const parsed = parseFloat(unitsRaw);
          if (!isNaN(parsed)) {
            setUnitsRaw(parsed.toString());
          } else {
            setUnitsRaw(units.toString());
          }
        }}
        inputMode="decimal"
      />
      <ActionsContainer>
        <Button
          variant="shout"
          startIcon={<GiReceiveMoney />}
          disabled={!date || !ticker || !units || loading}
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

export default ActivityStockDividendForm;
