import React, { useState } from 'react';
import { RiAddLine, RiDeleteBinLine } from 'react-icons/ri';
import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import DateInput from './DateInput';
import CurrencyInput from './CurrencyInput';
import Select from './Select';
import Button from './Button';
import TextInput from './TextInput';
import type { ActivityFormProps } from './ActivityForms';
import { ActionsContainer, Field, Label } from 'commonStyledComponents';
import useStocksList from 'hooks/useStocksList';
import { theme, getTheme } from 'theme';
import Type from './Type';

const InvestmentsContainer = styled.div`
  border-radius: ${theme.spacings('xs')};
  border: 2px solid
    ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
  padding: ${theme.spacings('s')};
  margin-bottom: ${theme.spacings('s')};
`;

const InvestmentRow = styled.div`
  display: flex;
  align-items: flex-end;
  > :first-child {
    flex-grow: 1;
    margin-right: ${theme.spacings('xs')};
  }
  button {
    margin: 0 0 0 ${theme.spacings('xs')};
  }
`;

const AddInvestment = styled.div`
  margin-bottom: ${theme.spacings('s')};
  border-bottom: 1px solid
    ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
`;

interface ActivityTradeFormProps extends ActivityFormProps {
  mode: 'buy' | 'sell';
}

function ActivityTradeForm({
  mode,
  currency,
  initialActivity,
  onClose,
  onSubmit,
  onDelete,
}: ActivityTradeFormProps) {
  const { stocksList } = useStocksList();
  const [date, setDate] = useState<Date>(initialActivity?.date ?? new Date());
  const [tickerToAdd, setTickerToAdd] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState(0);
  const [quantityToAddRaw, setQuantityToAddRaw] = useState('0');
  const [cost, setCost] = useState(
    (initialActivity?.type === 'Trade' ? initialActivity.cost : null) ?? 0
  );
  const [tickers, setTickers] = useState<
    { ticker: string; units: number; raw: string }[]
  >(
    (initialActivity?.type === 'Trade'
      ? initialActivity.trades.map((trade) => ({
          ticker: trade.ticker,
          units: trade.units,
          raw: trade.units.toString(),
        }))
      : null) ?? []
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
            await onSubmit({
              type: 'Trade',
              date,
              trades: tickers.map(({ ticker, units }) => ({
                ticker,
                units: mode === 'buy' ? units : units * -1,
              })),
              cost: mode === 'buy' ? cost : cost * -1,
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
      <Label>{mode === 'buy' ? 'Buys' : 'Sells'}*</Label>
      <InvestmentsContainer>
        <AddInvestment>
          <InvestmentRow>
            <Select
              label="Investment"
              options={[
                {
                  label: 'Select...',
                  value: '',
                },
                ...availableStocks.filter(
                  (stock) =>
                    !tickers.find(({ ticker }) => ticker === stock.value)
                ),
              ]}
              value={tickerToAdd}
              onChange={(e) => setTickerToAdd(e.target.value)}
            />
            <div>
              <TextInput
                label="Quantity"
                value={quantityToAddRaw}
                onChange={(e) => {
                  const val = e.target.value;
                  const parsed = parseFloat(val);
                  setQuantityToAddRaw(val);
                  if (!isNaN(parsed)) {
                    setQuantityToAdd(parsed);
                  }
                }}
                onBlur={() => {
                  const val = parseFloat(quantityToAddRaw);
                  if (!isNaN(val)) {
                    setQuantityToAdd(val);
                    setQuantityToAddRaw(val.toString());
                  } else {
                    setQuantityToAddRaw(quantityToAdd.toString());
                  }
                }}
                inputMode="decimal"
              />
            </div>
            <Field>
              <Button
                variant="primary"
                startIcon={<RiAddLine />}
                disabled={!tickerToAdd || !quantityToAdd}
                onClick={() => {
                  setTickers((current) => [
                    ...current,
                    {
                      ticker: tickerToAdd,
                      units: quantityToAdd,
                      raw: quantityToAdd.toString(),
                    },
                  ]);
                  setTickerToAdd('');
                  setQuantityToAdd(0);
                  setQuantityToAddRaw('0');
                }}
              >
                Add
              </Button>
            </Field>
          </InvestmentRow>
        </AddInvestment>

        {!tickers.length && (
          <Type scale="body2" as="span">
            Add the investments to {mode === 'buy' ? 'buy' : 'sell'}
          </Type>
        )}
        {tickers.map(({ ticker, units, raw }) => (
          <InvestmentRow key={`investment-${ticker}`}>
            <TextInput
              label={
                availableStocks.find(({ value }) => value === ticker)?.label ??
                `${ticker}`
              }
              value={raw ?? '0'}
              onChange={(e) => {
                const val = e.target.value;
                setTickers((current) =>
                  current.map((investment) =>
                    investment.ticker === ticker
                      ? { ticker, units, raw: val }
                      : investment
                  )
                );
              }}
              onBlur={() => {
                const val = parseFloat(raw);
                if (!isNaN(val)) {
                  setTickers((current) =>
                    current.map((investment) =>
                      investment.ticker === ticker
                        ? { ticker, units: val, raw: val.toString() }
                        : investment
                    )
                  );
                } else {
                  setTickers((current) =>
                    current.map((investment) =>
                      investment.ticker === ticker
                        ? { ticker, units, raw: units.toString() }
                        : investment
                    )
                  );
                }
              }}
              inputMode="decimal"
            />
            <Field>
              <Button
                icon={<RiDeleteBinLine />}
                onClick={() =>
                  setTickers((current) =>
                    current.filter(
                      ({ ticker: currentTicker }) => currentTicker !== ticker
                    )
                  )
                }
              />
            </Field>
          </InvestmentRow>
        ))}
      </InvestmentsContainer>

      <CurrencyInput
        label={mode === 'buy' ? 'Total Cost' : 'Total Amount'}
        value={cost}
        onChange={setCost}
        currency={currency}
        required
      />
      <ActionsContainer>
        <Button
          variant="shout"
          disabled={!date || !tickers.length || !cost || loading}
        >
          {mode === 'buy' ? 'Buy' : 'Sell'}
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

export default ActivityTradeForm;
