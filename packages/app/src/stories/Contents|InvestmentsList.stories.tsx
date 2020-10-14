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
      portfolios: [],
      handleChangePortfolio: () => {},
      loaded: true,
    }}
  >
    <div style={{ textAlign: 'left' }}>
      <InvestmentsList
        portfolioPerformance={
          {
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
                  Ticker: 'AAPL.US',
                  Code: 'AAPL',
                  Name: 'Apple Inc.',
                  Country: 'USA',
                  Exchange: 'NASDAQ',
                  Currency: 'USD',
                },
                livePrice: {
                  close: 383.68,
                  previousClose: 382.73,
                  date: new Date(),
                } as any,
                quantity: 1,
                value: 303.97,
                gain: 103.52,
                roi: 0.3688,
                dayChange: 0.95,
                dayChangePercentage: 0.0025,
              },
              'VUKE.LSE': {
                info: {
                  Ticker: 'VUKE.LSE',
                  Code: 'VUKE',
                  Name: 'Vanguard FTSE 100 UCITS ETF',
                  Country: 'UK',
                  Exchange: 'LSE',
                  Currency: 'GBP',
                },
                livePrice: {
                  close: 26.89,
                  previousClose: 26.66,
                  date: new Date(),
                } as any,
                quantity: 47,
                value: 1263.83,
                gain: 133.62,
                roi: 0.0956,
                dayChange: 0.23,
                dayChangePercentage: 0.0088,
              },
            },
            series: {} as any,
          } as any
        }
      />
    </div>
  </PortfolioContext.Provider>
);
