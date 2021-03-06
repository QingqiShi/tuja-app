import { useState } from 'react';
import { GiReceiveMoney } from 'react-icons/gi';
import { RiDeleteBinLine } from 'react-icons/ri';
import { Button, DateInput, NumberInput, Select } from '@tuja/components';
import type { ActivityFormProps } from '@tuja/libs';
import { ActionsContainer } from 'commonStyledComponents';
import usePortfolio from 'hooks/usePortfolio';

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
              type: 'StockDividend',
              date,
              ticker,
              units,
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
      <NumberInput
        label="Number of Shares Received"
        value={units}
        onChange={setUnits}
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
