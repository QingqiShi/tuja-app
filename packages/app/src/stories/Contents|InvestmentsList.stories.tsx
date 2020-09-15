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
            'AAPL.US': {
              info: {
                Code: 'AAPL',
                Name: 'Apple Inc.',
                Country: 'USA',
                Exchange: 'US',
                Currency: 'USD',
                Quote: 383.68,
                PrevClose: 382.73,
                QuoteDate: new Date(),
              },
              quantity: 1,
              value: 303.97,
              gain: 103.52,
              roi: 0.3688,
              dayChange: 0.95,
              dayChangePercentage: 0.0025,
            },
            'VUKE.LSE': {
              info: {
                Code: 'VUKE',
                Name: 'Vanguard FTSE 100 UCITS ETF',
                Country: 'UK',
                Exchange: 'LSE',
                Currency: 'GBP',
                Quote: 26.89,
                PrevClose: 26.66,
                QuoteDate: new Date(),
              },
              quantity: 47,
              value: 1263.83,
              gain: 133.62,
              roi: 0.0956,
              dayChange: 0.23,
              dayChangePercentage: 0.0088,
            },
          },
          series: {} as any,
        }}
      />
    </div>
  </PortfolioContext.Provider>
);
