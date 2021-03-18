import { useState, useEffect } from 'react';
import { RiEdit2Line } from 'react-icons/ri';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { Button, Type, InvestmentItem, Modal, v } from '@tuja/components';
import { formatCurrency } from '@tuja/libs';
import { PortfolioPerformance } from '../libs/portfolioClient';
import { fetchStockLogo } from '../libs/stocksClient';
import usePortfolio from '../hooks/usePortfolio';
import usePortfolioProcessor from '../hooks/usePortfolioProcessor';
import useStartDate from '../hooks/useStartDate';
import useAuth from '../hooks/useAuth';
import {
  getDB,
  getStocksHistory,
  getStocksLivePrice,
  mergeLivePriceIntoHistory,
} from '../libs/cachedStocksData';
import type { StockHistory } from '../libs/stocksClient';
import UpdateAlias from './UpdateAlias';

const Label = styled.div`
  font-size: 0.9rem;
  line-height: 1.2em;
  font-weight: ${v.fontSemiBold};
  color: ${v.textSecondary};
  margin-bottom: 0;
`;

const DataRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  padding-top: ${v.spacerS};
  grid-gap: ${v.spacerXS};
  @media (${v.minLaptop}) {
    grid-gap: ${v.spacerS};
  }
  p {
    margin: 0;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: ${v.spacerS};
`;

interface InvestmentsListItemProps {
  ticker: string;
  holdingPerformance: PortfolioPerformance['portfolio']['holdings'][''];
  portfolioValue: number;
  mode?: 'GAIN' | 'VALUE' | 'ALLOCATION' | 'TODAY';
}

const endDate = new Date();

function InvestmentsListItem({
  ticker,
  holdingPerformance,
  portfolioValue,
  mode,
}: InvestmentsListItemProps) {
  const { state } = useAuth();
  const { portfolio } = usePortfolio();
  const { isReady } = usePortfolioProcessor();
  const [startDate] = useStartDate();

  // Modals
  const [showDetails, setShowDetails] = useState(false);
  const [showAlias, setShowAlias] = useState(false);

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
        onClick={() => setShowDetails(true)}
      />
      <Modal
        width={30}
        open={showDetails}
        onClose={() => setShowDetails(false)}
      >
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
            <Button onClick={() => setShowDetails(false)}>Close</Button>
            <Button
              variant="primary"
              startIcon={<RiEdit2Line />}
              onClick={() => setShowAlias(true)}
            >
              Set Alias
            </Button>
          </ActionsContainer>
        )}
      </Modal>
      <Modal onClose={() => setShowAlias(false)} open={showAlias}>
        <UpdateAlias ticker={ticker} onClose={() => setShowAlias(false)} />
      </Modal>
    </>
  );
}

export default InvestmentsListItem;
