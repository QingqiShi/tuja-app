import { useState, useEffect } from 'react';
import { RiEdit2Line } from 'react-icons/ri';
import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import { Button, Type, InvestmentItem, Modal } from '@tuja/components';
import { formatCurrency } from '@tuja/libs';
import { PortfolioPerformance } from 'libs/portfolioClient';
import { fetchStockLogo } from 'libs/stocksClient';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioProcessor from 'hooks/usePortfolioProcessor';
import useStartDate from 'hooks/useStartDate';
import useAuth from 'hooks/useAuth';
import { theme, getTheme } from 'theme';
import {
  getDB,
  getStocksHistory,
  getStocksLivePrice,
  mergeLivePriceIntoHistory,
} from 'libs/cachedStocksData';
import type { StockHistory } from 'libs/stocksClient';
import dayjs from 'dayjs';

const Label = styled.div`
  font-size: ${theme.fonts.labelSize};
  line-height: ${theme.fonts.labelHeight};
  font-weight: ${theme.fonts.labelWeight};
  color: ${getTheme(theme.colors.textOnBackground, (color) =>
    transparentize(0.4, color)
  )};
  margin-bottom: 0;
  @media (${theme.breakpoints.minLaptop}) {
    margin-bottom: 0;
  }
`;

const DataRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  padding-top: ${theme.spacings('s')};
  grid-gap: ${theme.spacings('xs')};
  @media (${theme.breakpoints.minLaptop}) {
    grid-gap: ${theme.spacings('s')};
  }
  p {
    margin: 0;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${theme.spacings('s')};
`;

interface InvestmentsListItemProps {
  ticker: string;
  holdingPerformance: PortfolioPerformance['holdings'][''];
  portfolioValue: number;
  showDetails?: boolean;
  mode?: 'GAIN' | 'VALUE' | 'ALLOCATION' | 'TODAY';
  onToggle?: () => void;
  onSetAlias?: () => void;
}

const endDate = new Date();

function InvestmentsListItem({
  ticker,
  holdingPerformance,
  portfolioValue,
  showDetails,
  mode,
  onToggle,
  onSetAlias,
}: InvestmentsListItemProps) {
  const { state } = useAuth();
  const { portfolio } = usePortfolio();
  const { isReady } = usePortfolioProcessor();
  const [startDate] = useStartDate();

  // Load stock history from cache so we can display chart
  const [stockHistory, setStockHistory] = useState<StockHistory | null>(null);
  useEffect(() => {
    const fetch = async () => {
      if (startDate) {
        const db = await getDB();
        const [histories, livePrices] = await Promise.all([
          getStocksHistory(db, [ticker], startDate, endDate),
          getStocksLivePrice(db, [ticker]),
        ]);
        const livePrice = livePrices[ticker];
        const history = histories[ticker];
        if (livePrice && history) {
          mergeLivePriceIntoHistory(livePrice, history);
          setStockHistory(history);
        }
      }
    };
    if (isReady) {
      fetch();
    }
  }, [isReady, startDate, ticker]);

  const { value, units, info, livePrice } = holdingPerformance;

  const [stockLogo, setStockLogo] = useState('');
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      if (info?.Name) {
        const base64 = await fetchStockLogo(ticker, info.Name);
        if (mounted) {
          setStockLogo(base64);
        }
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, [info?.Name, ticker]);

  if (!portfolio || portfolioValue === 0) {
    return null;
  }

  const { currency, aliases } = portfolio;

  const costBasis = portfolio.costBasis?.[ticker] ?? 0;
  const totalCost = costBasis * units;
  const gain = value - totalCost;
  const returns = gain / value;

  let additional: string = '';
  if (mode === 'GAIN' || mode === 'TODAY') {
    additional = `${gain >= 0 ? '+' : ''}${formatCurrency(currency, gain)}`;
  }
  if (mode === 'VALUE') {
    additional = formatCurrency(currency, value);
  }
  if (mode === 'ALLOCATION') {
    additional = `${((value / portfolioValue) * 100).toFixed(1)}%`;
  }

  return (
    <>
      <InvestmentItem
        code={info.Code ?? ''}
        name={aliases?.[ticker] ?? info?.Name ?? ticker}
        icon={stockLogo}
        chartData={stockHistory?.adjusted?.data.filter(
          (dp) => startDate && dp[0] >= startDate
        )}
        changePercentage={
          livePrice.change_p === 'NA' || !dayjs().isSame(livePrice.date, 'day')
            ? 0
            : livePrice.change_p
        }
        additional={additional}
        onClick={onToggle}
      />
      <Modal width={30} open={showDetails} onClose={onToggle}>
        <DataRow>
          <div>
            <Label>Ticker</Label>
            <Type scale="body1">{ticker}</Type>
          </div>
          <div>
            <Label>Name</Label>
            <Type scale="body1">{info.Name}</Type>
          </div>
          <div>
            <Label>Gain</Label>
            <Type scale="body1">{formatCurrency(currency, gain)}</Type>
          </div>
          <div>
            <Label>Return</Label>
            <Type scale="body1">{(returns * 100).toFixed(2)}%</Type>
          </div>
          <div>
            <Label>Current Value</Label>
            <Type scale="body1">{formatCurrency(currency, value)}</Type>
          </div>
          <div>
            <Label>No. units</Label>
            <Type scale="body1">{units}</Type>
          </div>
          <div>
            <Label>Current price</Label>
            <Type scale="body1">
              {info &&
                livePrice &&
                (livePrice.close === 'NA'
                  ? 'NA'
                  : formatCurrency(info.Currency, livePrice.close))}
            </Type>
          </div>
          <div>
            <Label>Est. cost per unit</Label>
            <Type scale="body1">{formatCurrency(currency, costBasis)}</Type>
          </div>
          <div>
            <Label>Today's change</Label>
            <Type scale="body1">
              {livePrice.change_p === 'NA'
                ? 'NA'
                : `${(livePrice?.change_p ?? 0) >= 0 ? '+' : ''}${(
                    livePrice?.change_p ?? 0
                  ).toFixed(2)}%`}
            </Type>
          </div>
          <div>
            <Label>Allocation (target)</Label>
            <Type scale="body1">
              {((value / portfolioValue) * 100).toFixed(1)}% (
              {((portfolio?.targetAllocations?.[ticker] ?? 0) * 100).toFixed(2)}
              %)
            </Type>
          </div>
        </DataRow>
        {state === 'SIGNED_IN' && (
          <ActionsContainer>
            <Button onClick={onToggle}>Close</Button>
            <Button
              variant="primary"
              startIcon={<RiEdit2Line />}
              onClick={onSetAlias}
            >
              Set Alias
            </Button>
          </ActionsContainer>
        )}
      </Modal>
    </>
  );
}

export default InvestmentsListItem;
