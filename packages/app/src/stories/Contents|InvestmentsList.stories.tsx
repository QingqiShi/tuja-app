import React from 'react';
import { PortfolioContext } from 'hooks/usePortfolio';
import InvestmentsList from 'components/InvestmentsList';

const InvestmentsTableStories = {
  title: 'Contents/InvestmentsList',
  component: InvestmentsList,
};

export default InvestmentsTableStories;

export const Demo = () => (
  <PortfolioContext.Provider
    value={{
      portfolio: { currency: 'GBP', aliases: {} } as any,
      loaded: true,
    }}
  >
    <div style={{ textAlign: 'left' }}>
      <InvestmentsList
        portfolioPerformance={{
          id: 'test',
          value: 200,
          gain: 20,
          roi: 0.1,
          remainingCash: 0,
          dividendReceived: 0,
          totalDeposit: 200,
          holdings: {
            AAPL: {
              info: {
                name: 'Apple Inc.',
                currency: 'USD',
                quote: 383.68,
                timestamp: Date.now(),
                yield: 0.0085,
                prevClose: 382.73,
              },
              quantity: 1,
              value: 303.97,
              gain: 103.52,
              roi: 0.3688,
              dayChange: 0.95,
              dayChangePercentage: 0.0025,
            },
            'VUKE.L': {
              quantity: 47,
              value: 1263.83,
              gain: 133.62,
              roi: 0.0956,
              dayChange: 0.23,
              dayChangePercentage: 0.0088,
              info: {
                name: 'Vanguard FTSE 100 UCITS ETF',
                currency: 'GBP',
                quote: 26.89,
                timestamp: Date.now(),
                yield: 0.0554,
                prevClose: 26.66,
              },
            },
          },
          series: {} as any,
        }}
      />
    </div>
  </PortfolioContext.Provider>
);
