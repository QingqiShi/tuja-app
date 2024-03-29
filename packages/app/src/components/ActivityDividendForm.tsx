import { useState } from 'react';
import { GiReceiveMoney } from 'react-icons/gi';
import { RiDeleteBinLine } from 'react-icons/ri';
import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonTertiary,
  DateInput,
  Select,
} from '@tuja/components';
import type { ActivityFormProps } from '@tuja/libs';
import CurrencyInput from './CurrencyInput';
import { ActionsContainer } from '../commonStyledComponents';
import usePortfolio from '../hooks/usePortfolio';

function ActivityDividendForm({
  currency,
  initialActivity,
  onClose,
  onSubmit,
  onDelete,
}: ActivityFormProps) {
  const { portfolio } = usePortfolio();
  const [date, setDate] = useState<Date>(initialActivity?.date ?? new Date());
  const [ticker, setTicker] = useState(
    (initialActivity?.type === 'Dividend' ? initialActivity.ticker : null) ?? ''
  );
  const [amount, setAmount] = useState(
    (initialActivity?.type === 'Dividend' ? initialActivity.amount : null) ?? 0
  );
  const [loading, setLoading] = useState(false);

  const availableStocks =
    Object.keys(portfolio?.latestSnapshot?.numShares ?? {}).map((ticker) => ({
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
              ...initialActivity,
              type: 'Dividend',
              date,
              ticker,
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
      <Select
        label="From Investment"
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
      <CurrencyInput
        label="Amount Received"
        value={amount}
        onChange={setAmount}
        currency={currency}
        required
      />
      <ActionsContainer>
        <ButtonPrimary
          type="submit"
          disabled={!date || !ticker || !amount || loading}
        >
          <GiReceiveMoney />
          <span>Dividend</span>
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

export default ActivityDividendForm;
