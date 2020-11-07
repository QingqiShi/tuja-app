import React, { useState, useEffect } from 'react';
import { useDebounce } from 'react-use';
import { RiAddLine, RiDeleteBinLine } from 'react-icons/ri';
import firebase from 'firebase/app';
import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import { v4 as uuid } from 'uuid';
import {
  Button,
  DateInput,
  NumberInput,
  TextInput,
  Type,
} from '@tuja/components';
import CurrencyInput from './CurrencyInput';
import {
  ActionsContainer,
  Field,
  Label,
  Card,
  CardMedia,
} from 'commonStyledComponents';
import useStocksData from 'hooks/useStocksData';
import usePortfolioPerformance from 'hooks/usePortfolioPerformance';
import { theme, getTheme } from 'theme';
import type { Activity, ActivityFormProps } from 'libs/activities';

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

const SearchContainer = styled.div`
  position: relative;
`;

const SearchSuggestions = styled(Card)`
  position: absolute;
  top: 5rem;
  width: 100%;
  max-height: 10rem;
  overflow: auto;
  z-index: 10;

  button {
    margin: 0;
  }
`;

const SearchSuggestionItem = styled.button`
  cursor: pointer;
  background: transparent;
  text-align: left;
  border: none;
  font-family: ${theme.fontFamily};
  font-size: ${theme.fonts.ctaSize};
  line-height: ${theme.fonts.ctaHeight};
  letter-spacing: ${theme.fonts.ctaSpacing};
  color: ${theme.colors.textOnBackground};
  padding: ${theme.spacings('s')};

  &:hover {
    background-color: ${theme.colors.callToAction};
    color: ${theme.colors.textOnCallToAction};
  }
`;

const getInitialCost = (activity?: Activity) => {
  if (activity?.type !== 'Trade') return 0;
  if (activity.cost < 0) return activity.cost * -1;
  return activity.cost;
};

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
  const { stocksData } = useStocksData();
  const { portfolioPerformance } = usePortfolioPerformance();
  const [date, setDate] = useState<Date>(initialActivity?.date ?? new Date());
  const [tickerToAdd, setTickerToAdd] = useState('');
  const [quantityToAdd, setQuantityToAdd] = useState(0);
  const [cost, setCost] = useState(getInitialCost(initialActivity));
  const [remainingCash, setRemainingCash] = useState(0);
  const [tickers, setTickers] = useState<{ ticker: string; units: number }[]>(
    (initialActivity?.type === 'Trade'
      ? initialActivity.trades.map((trade) => ({
          ticker: trade.ticker,
          units: trade.units,
        }))
      : null) ?? []
  );

  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  useDebounce(
    () => {
      setDebouncedSearchQuery(searchQuery);
    },
    500,
    [searchQuery]
  );

  const [searchSuggestions, setSearchSuggestions] = useState<
    { Code: string; Exchange: string; Name: string }[]
  >([]);
  useEffect(() => {
    const fetch = async () => {
      const searchStocks = firebase.functions().httpsCallable('searchStocks');
      const result = await searchStocks({ query: debouncedSearchQuery });
      setSearchSuggestions(result.data);
    };

    if (debouncedSearchQuery) {
      fetch();
    } else {
      setSearchSuggestions([]);
    }
  }, [debouncedSearchQuery]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          if (onSubmit) {
            await onSubmit({
              id: initialActivity?.id ?? uuid(),
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
      <DateInput label="Date" value={date} onChange={setDate} required />
      <Label>{mode === 'buy' ? 'Buys' : 'Sells'}*</Label>
      <InvestmentsContainer>
        <AddInvestment>
          <InvestmentRow>
            {!tickerToAdd && (
              <SearchContainer>
                <TextInput
                  label="Investment Symbol"
                  placeholder="e.g. AAPL"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                />
                {searchFocused && !!searchSuggestions.length && (
                  <SearchSuggestions>
                    <CardMedia>
                      {searchSuggestions.map((suggestion) => (
                        <SearchSuggestionItem
                          key={`${suggestion.Code}.${suggestion.Exchange}`}
                          onClick={() => {
                            setTickerToAdd(
                              `${suggestion.Code}.${suggestion.Exchange}`
                            );
                            setSearchFocused(false);
                            setSearchQuery('');
                          }}
                          type="button"
                        >
                          <span>
                            {suggestion.Code}.{suggestion.Exchange}
                          </span>
                          <span> - </span>
                          <span>{suggestion.Name}</span>
                        </SearchSuggestionItem>
                      ))}
                    </CardMedia>
                  </SearchSuggestions>
                )}
              </SearchContainer>
            )}

            {tickerToAdd && (
              <div onClick={() => setTickerToAdd('')}>
                <TextInput
                  label="Investment Symbol"
                  value={tickerToAdd}
                  disabled
                />
              </div>
            )}
            {tickerToAdd && (
              <div>
                <NumberInput
                  label="Quantity"
                  value={quantityToAdd}
                  onChange={setQuantityToAdd}
                />
              </div>
            )}
            <Field>
              <Button
                variant="primary"
                type="button"
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
        {tickers.map(({ ticker, units }) => (
          <InvestmentRow key={`investment-${ticker}`}>
            <NumberInput
              label={
                stocksData[ticker]?.info?.Name
                  ? `${ticker} - ${stocksData[ticker]?.info?.Name}`
                  : `${ticker}`
              }
              value={units}
              onChange={(newUnits) =>
                setTickers((current) =>
                  current.map((investment) =>
                    investment.ticker === ticker
                      ? { ticker, units: newUnits }
                      : investment
                  )
                )
              }
            />
            <Field>
              <Button
                icon={<RiDeleteBinLine />}
                type="button"
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

      <InvestmentsContainer>
        <InvestmentRow>
          <CurrencyInput
            label="Calculate cost (enter remaining cash)"
            value={remainingCash}
            onChange={setRemainingCash}
            currency={currency}
          />
          <Field>
            <Button
              type="button"
              disabled={!remainingCash}
              onClick={() => {
                setCost(
                  mode === 'buy'
                    ? (portfolioPerformance?.cash ?? 0) - remainingCash
                    : remainingCash - (portfolioPerformance?.cash ?? 0)
                );
                setRemainingCash(0);
              }}
            >
              Calculate
            </Button>
          </Field>
        </InvestmentRow>
      </InvestmentsContainer>

      <ActionsContainer>
        <Button
          variant="shout"
          disabled={!date || !tickers.length || loading}
          type="submit"
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
