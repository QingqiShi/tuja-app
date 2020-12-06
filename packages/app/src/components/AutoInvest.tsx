import { useState, useEffect } from 'react';
import styled from 'styled-components/macro';
import { Table, TableRow, TableHeader, TableCell } from '@tuja/components';
import CurrencyInput from 'components/CurrencyInput';
import usePortfolio from 'hooks/usePortfolio';
import { PortfolioPerformance } from 'libs/portfolio';
import { formatCurrency } from 'libs/forex';
import { CardMedia } from 'commonStyledComponents';
import { theme } from 'theme';

const Label = styled.label`
  font-size: ${theme.fonts.labelSize};
  line-height: ${theme.fonts.labelHeight};
  font-weight: ${theme.fonts.labelWeight};
  margin-bottom: ${theme.spacings('xs')};
  display: block;
  text-align: left;
`;

interface AutoInvestProps {
  portfolioPerformance: PortfolioPerformance;
}

function AutoInvest({ portfolioPerformance }: AutoInvestProps) {
  const { portfolio } = usePortfolio();

  const targetAllocations = portfolio?.targetAllocations;
  const holdings = portfolioPerformance.holdings;
  const allocationTickers = Object.keys(targetAllocations ?? {});

  const [cash, setCash] = useState(portfolioPerformance.cash ?? 0);

  const stageOneCalcs = allocationTickers.map((ticker) => {
    const value = holdings[ticker]?.value ?? 0;
    const holdingsValue = portfolioPerformance.totalHoldingsValue;
    const targetAllocation = targetAllocations?.[ticker] ?? 0;
    const allocation = value / (holdingsValue + cash);
    const underWeightValue =
      allocation < targetAllocation
        ? (holdingsValue + cash) * targetAllocation - value
        : 0;
    return {
      ticker,
      value,
      holdingsValue,
      targetAllocation,
      allocation,
      underWeightValue,
    };
  });
  const totalUnderWeightValues = stageOneCalcs.reduce(
    (total, { underWeightValue }) => total + underWeightValue,
    0
  );

  useEffect(() => {
    setCash(portfolioPerformance.cash);
  }, [portfolioPerformance.cash]);

  return portfolio && targetAllocations ? (
    <div>
      <CurrencyInput
        label="Cash"
        currency={portfolio.currency}
        value={cash}
        onChange={(val) => setCash(val)}
      />
      <Label>Buys</Label>
      <CardMedia>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Investment</TableHeader>
              <TableHeader>Amount to buy</TableHeader>
              <TableHeader>Allocation after buy</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {stageOneCalcs.map(
              ({ ticker, underWeightValue, value, holdingsValue }) => {
                const underValueRatio = totalUnderWeightValues
                  ? underWeightValue / totalUnderWeightValues
                  : 0;
                const buyValue = cash * underValueRatio;
                const allocationAfterBuy =
                  (value + buyValue) / (holdingsValue + cash);
                return (
                  <TableRow key={`auto-invest-${ticker}`}>
                    <TableCell
                      secondary={
                        portfolio.aliases[ticker] ??
                        holdings[ticker].info?.Name ??
                        ticker
                      }
                    >
                      {ticker}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(portfolio.currency, buyValue)}
                    </TableCell>
                    <TableCell>
                      {(allocationAfterBuy * 100).toFixed(1)}%
                    </TableCell>
                  </TableRow>
                );
              }
            )}
          </tbody>
        </Table>
      </CardMedia>
    </div>
  ) : null;
}

export default AutoInvest;
