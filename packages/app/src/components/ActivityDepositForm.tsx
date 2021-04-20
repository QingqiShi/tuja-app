import { useState } from 'react';
import { RiHandCoinLine, RiDeleteBinLine } from 'react-icons/ri';
import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonTertiary,
  DateInput,
} from '@tuja/components';
import type { ActivityFormProps } from '@tuja/libs';
import CurrencyInput from './CurrencyInput';
import { ActionsContainer } from '../commonStyledComponents';

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
              ...initialActivity,
              type: 'Deposit',
              date,
              amount,
            });
          }
          if (onClose) {
            onClose();
          }
        } catch {
          setLoading(false);
        }
      }}
    >
      <DateInput label="Date" value={date} onChange={setDate} required />
      <CurrencyInput
        label="Deposit Amount"
        value={amount}
        onChange={setAmount}
        currency={currency}
        required
      />
      <ActionsContainer>
        <ButtonPrimary type="submit" disabled={!date || !amount || loading}>
          <RiHandCoinLine />
          <span>Deposit</span>
        </ButtonPrimary>
        {initialActivity && (
          <ButtonSecondary
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
          >
            <RiDeleteBinLine />
          </ButtonSecondary>
        )}
        <ButtonTertiary onClick={onClose}>Cancel</ButtonTertiary>
      </ActionsContainer>
    </form>
  );
}

export default ActivityDepositForm;
