import { useState, useEffect } from 'react';
import {
  RiDeleteBinLine,
  RiCheckboxCircleFill,
  RiAddCircleLine,
  RiArrowRightLine,
  RiEditLine,
  RiCheckLine,
  RiCalendarLine,
  RiCloseLine,
} from 'react-icons/ri';
import styled, { css } from 'styled-components/macro';
import { transparentize } from 'polished';
import { v4 as uuid } from 'uuid';
import {
  Button,
  DateInput,
  LinearLoader,
  Modal,
  NumberInput,
  SearchSuggest,
  StockListItem,
  Type,
} from '@tuja/components';
import { exchangeCurrency, formatCurrency } from '@tuja/libs';
import CurrencyInput from './CurrencyInput';
import usePortfolioProcessor from 'hooks/usePortfolioProcessor';
import { theme, getTheme } from 'theme';
import type { Activity, ActivityFormProps } from 'libs/activities';
import {
  fetchStockSearch,
  fetchStocksInfo,
  fetchStocksPrices,
  StockInfo,
} from 'libs/stocksClient';
import { PortfolioPerformance } from 'libs/portfolio';

const verticalCenter = css`
  display: flex;
  align-items: center;
`;

const ActionsContainer = styled.div`
  ${verticalCenter}
  justify-content: space-between;
  margin-top: ${({ theme }) => theme.spacings.s};
`;

const SuggestionRow = styled.div`
  ${verticalCenter}
  > :first-child {
    flex-grow: 1;
  }
  > :last-child:not(:first-child) {
    font-size: 1.2rem;
  }
`;

const QuantitiesContainer = styled.div`
  margin-bottom: ${theme.spacings('s')};
  border-bottom: 1px solid
    ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};
`;

const Row = styled.div`
  margin-top: ${({ theme }) => theme.spacings.s};

  > * {
    display: block;
  }

  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: ${({ theme }) => theme.spacings.xs};
  }
`;

const EditableField = styled.div`
  text-align: right;
  margin-top: ${({ theme }) => theme.spacings.xs};
  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    margin-top: 0;
    width: 60%;
  }
`;

const LoaderContainer = styled.div`
  position: relative;
`;

const ButtonRow = styled.div`
  display: flex;
  align-items: flex-end;
  > :first-child {
    flex-grow: 1;
  }
  button {
    margin: 0 0 calc(${theme.spacings('s')} + 1px) ${theme.spacings('xs')};
  }
`;

const getInitialCost = (activity?: Activity) => {
  if (activity?.type !== 'Trade') return 0;
  if (activity.cost < 0) return activity.cost * -1;
  return activity.cost;
};

const getPortfolioSuggestions = (
  portfolioPerformance?: PortfolioPerformance | null
) =>
  Object.keys(portfolioPerformance?.holdings ?? {})
    .map((ticker) => portfolioPerformance?.holdings?.[ticker].info)
    .filter((info): info is StockInfo => !!info);

function decodeHtml(html: string) {
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

interface ActivityTradeModalProps extends ActivityFormProps {
  mode: 'buy' | 'sell';
}

function ActivityTradeModal({
  mode,
  currency,
  initialActivity,
  onClose,
  onSubmit,
  onDelete,
}: ActivityTradeModalProps) {
  const { portfolioPerformance } = usePortfolioProcessor();

  const [showStep, setShowStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Trade date
  const [date, setDate] = useState(initialActivity?.date ?? new Date());
  const [showDateInput, setShowDateInput] = useState(false);

  // Search suggestions
  const [searchSuggestions, setSearchSuggestions] = useState<StockInfo[]>(
    getPortfolioSuggestions(portfolioPerformance)
  );
  const search = async (query: string) => {
    if (query) {
      const searchResult = await fetchStockSearch(query);
      setSearchSuggestions([
        ...searchResult,
        ...selectedTickers.filter(
          ({ Ticker }) => !searchResult.find((s) => s.Ticker === Ticker)
        ),
      ]);
    } else {
      const portfolioHoldings = getPortfolioSuggestions(portfolioPerformance);
      setSearchSuggestions([
        ...portfolioHoldings,
        ...selectedTickers.filter(
          ({ Ticker }) => !portfolioHoldings.find((s) => s.Ticker === Ticker)
        ),
      ]);
    }
  };

  // Selected stocks info
  const [selectedTickers, setSelectedTickers] = useState<StockInfo[]>([]);

  // Quantities
  const [quantities, setQuantities] = useState<{ [ticker: string]: number }>(
    {}
  );

  // Total value
  const [totalValue, setTotalValue] = useState(getInitialCost(initialActivity));
  const [showTotalValueInput, setShowTotalValueInput] = useState(false);
  useEffect(() => {
    const fetch = async () => {
      const tickers = Object.keys(quantities);
      if (tickers.length && !showTotalValueInput) {
        setIsLoading(true);

        const prices = await fetchStocksPrices(tickers, date, currency);

        setTotalValue(
          tickers.reduce((total, ticker) => {
            const info = selectedTickers.find(
              ({ Ticker }) => Ticker === ticker
            );
            if (!info) {
              return total;
            }

            return (
              total +
              exchangeCurrency(
                prices[ticker] * quantities[ticker],
                info.Currency,
                currency,
                (forexPair) => prices[forexPair]
              )
            );
          }, 0)
        );
        setIsLoading(false);
      }
    };
    fetch();
  }, [currency, date, quantities, selectedTickers, showTotalValueInput]);

  // Load initial values when editing
  const [initialLoading, setInitialLoading] = useState(false);
  useEffect(() => {
    const fetch = async () => {
      if (initialActivity?.type === 'Trade') {
        setInitialLoading(true);
        const stocksInfo = await fetchStocksInfo(
          initialActivity.trades.map(({ ticker }) => ticker)
        );
        setSelectedTickers(stocksInfo);
        setSearchSuggestions((current) => [
          ...current,
          ...stocksInfo.filter(
            ({ Ticker }) => !current.find((s) => s.Ticker !== Ticker)
          ),
        ]);
        setQuantities(
          initialActivity.trades.reduce(
            (quantities, trade) => ({
              ...quantities,
              [trade.ticker]: trade.units,
            }),
            {}
          )
        );
        setShowStep(1);
        setInitialLoading(false);
      }
    };
    fetch();
  }, [initialActivity]);

  // Move back to step one if all tickers are removed
  useEffect(() => {
    if (selectedTickers.length === 0 && showStep > 0) {
      setShowStep(0);
    }
  }, [selectedTickers.length, showStep]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit({
          id: initialActivity?.id ?? uuid(),
          type: 'Trade',
          date,
          trades: selectedTickers.map(({ Ticker }) => ({
            ticker: Ticker,
            units:
              mode === 'buy' ? quantities[Ticker] : quantities[Ticker] * -1,
          })),
          cost: mode === 'buy' ? totalValue : totalValue * -1,
        });
      }
      setIsLoading(false);
      if (onClose) {
        onClose();
      }
    } catch {
      setIsLoading(false);
    }
  };

  const steps = [
    <>
      <Type scale="h4">Choose your investments</Type>
      <SearchSuggest
        onSearch={search}
        onClick={(i) => {
          const suggestion = searchSuggestions[i];
          setSelectedTickers((current) => {
            if (current.find(({ Ticker }) => Ticker === suggestion.Ticker)) {
              return current.filter(
                ({ Ticker }) => Ticker !== suggestion.Ticker
              );
            }
            return [...current, suggestion];
          });
        }}
        maxSuggestHeight={20}
        suggestions={searchSuggestions.map((suggestion) => (
          <SuggestionRow key={`suggest-row-${suggestion.Ticker}`}>
            <StockListItem
              code={suggestion.Code}
              exchange={suggestion.Exchange}
              name={suggestion.Name}
            />
            {selectedTickers.find(
              ({ Ticker }) => Ticker === suggestion.Ticker
            ) ? (
              <RiCheckboxCircleFill />
            ) : (
              <RiAddCircleLine />
            )}
          </SuggestionRow>
        ))}
      />
      <ActionsContainer>
        <div />
        <Button
          variant="shout"
          disabled={!selectedTickers.length || isLoading}
          onClick={() => setShowStep(1)}
          endIcon={<RiArrowRightLine />}
          compact
        >
          Selected {selectedTickers.length}
        </Button>
      </ActionsContainer>
    </>,
    <>
      <Type scale="h4">Number of shares</Type>
      <QuantitiesContainer>
        {selectedTickers.map(({ Ticker, Name }) => (
          <ButtonRow key={`quantity-${Ticker}`}>
            <NumberInput
              key={Ticker}
              label={Name ? `${Ticker} - ${decodeHtml(Name)}` : Ticker}
              value={quantities[Ticker] ?? 0}
              onChange={(newUnits) =>
                setQuantities((current) => {
                  if (newUnits) {
                    return { ...current, [Ticker]: newUnits };
                  }
                  delete current[Ticker];
                  return current;
                })
              }
            />
            <Button
              icon={<RiDeleteBinLine />}
              type="button"
              onClick={() => {
                setSelectedTickers((current) =>
                  current.filter(
                    ({ Ticker: currentTicker }) => currentTicker !== Ticker
                  )
                );
                setQuantities((current) => {
                  delete current[Ticker];
                  return current;
                });
              }}
            />
          </ButtonRow>
        ))}
      </QuantitiesContainer>
      <Row>
        <Type scale="body1" as="span" noMargin>
          Date
        </Type>
        <EditableField>
          {showDateInput ? (
            <ButtonRow>
              <DateInput value={date} onChange={setDate} />
              <Button
                icon={<RiCloseLine />}
                onClick={() => {
                  setShowDateInput(false);
                  setDate(new Date());
                }}
              />
            </ButtonRow>
          ) : (
            <Button
              endIcon={<RiCalendarLine />}
              onClick={() => setShowDateInput(true)}
            >
              {date.toLocaleDateString()}
            </Button>
          )}
        </EditableField>
      </Row>
      <Row>
        <Type scale="h6" as="span" noMargin>
          Total value
        </Type>
        <EditableField>
          {showTotalValueInput ? (
            <ButtonRow>
              <CurrencyInput
                value={totalValue}
                onChange={setTotalValue}
                currency={currency}
              />
              <Button
                icon={<RiCloseLine />}
                onClick={() => setShowTotalValueInput(false)}
              />
            </ButtonRow>
          ) : (
            <Button
              endIcon={<RiEditLine />}
              onClick={() => setShowTotalValueInput(true)}
            >
              {formatCurrency(currency, totalValue)}
            </Button>
          )}
        </EditableField>
      </Row>
      <ActionsContainer>
        <Button
          variant="primary"
          disabled={!date}
          onClick={() => setShowStep(0)}
          compact
        >
          Back
        </Button>
        {!!initialActivity && (
          <Button
            type="button"
            variant="primary"
            icon={<RiDeleteBinLine />}
            onClick={async () => {
              setIsLoading(true);
              try {
                if (onDelete) {
                  await onDelete();
                }
                setIsLoading(false);
                if (onClose) {
                  onClose();
                }
              } catch {
                setIsLoading(false);
              }
            }}
          />
        )}
        <Button
          variant="shout"
          disabled={!date || !Object.keys(quantities).length || isLoading}
          onClick={handleSubmit}
          endIcon={<RiCheckLine />}
          compact
        >
          {!initialActivity && (mode === 'buy' ? 'Buy' : 'Sell')}
          {!!initialActivity && `Update ${mode === 'buy' ? 'Buy' : 'Sell'}`}
        </Button>
      </ActionsContainer>
    </>,
  ];

  return (
    <Modal onClose={onClose} width={30}>
      {initialLoading ? (
        <LoaderContainer>
          <LinearLoader />
        </LoaderContainer>
      ) : (
        steps[showStep]
      )}
    </Modal>
  );
}

export default ActivityTradeModal;
