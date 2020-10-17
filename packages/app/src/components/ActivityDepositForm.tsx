import React, { useState } from 'react';
import { RiHandCoinLine, RiDeleteBinLine } from 'react-icons/ri';
import { v4 as uuid } from 'uuid';
import DateInput from './DateInput';
import CurrencyInput from './CurrencyInput';
import Button from './Button';
import { ActionsContainer } from 'commonStyledComponents';
import type { ActivityFormProps } from 'libs/activities';

function ActivityDepositForm({
  currency,
  initialActivity,
  onClose,
  onSubmit,
  onDelete,
}: ActivityFormProps) {
  const [date, setDate] = useState<Date>(initialActivity?.date ?? new Date());
  const [amount, setAmount] = useState(
    (initialActivity?.type === 'Deposit' ? initialActivity.amount : null) ?? 0
  );
  const [loading, setLoading] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          if (onSubmit) {
            await onSubmit({
              id: initialActivity?.id ?? uuid(),
              type: 'Deposit',
              date,
              amount,
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
      <CurrencyInput
        label="Deposit Amount"
        value={amount}
        onChange={setAmount}
        currency={currency}
        required
      />
      <ActionsContainer>
        <Button
          variant="shout"
          startIcon={<RiHandCoinLine />}
          disabled={!date || !amount || loading}
        >
          Deposit
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

export default ActivityDepositForm;
