import React from 'react';
import InvestmentsTable from 'components/InvestmentsTable';

const InvestmentsTableStories = {
  title: 'Contents/InvestmentsTable',
  component: InvestmentsTable,
};

export default InvestmentsTableStories;

export const Demo = () => (
  <div style={{ textAlign: 'left' }}>
    <InvestmentsTable
      currency="GBP"
      portfolioPerformance={
        {
          summary: {
            endingBalance: 200,
            holdings: [
              {
                ticker: 'AAPL',
                name: 'Apple',
                price: 303.97,
                quantity: 1,
                value: 303.97,
                gain: 103.52,
                returns: 0.3688,
                dayChange: 0.95,
                dayChangePercentage: 0.0025,
                info: {
                  name: 'Apple Inc.',
                  currency: 'USD',
                  quote: 383.68,
                  timestamp: Date.now(),
                  yield: 0.0085,
                  prevClose: 382.73,
                },
              },
              {
                ticker: 'VUKE.L',
                name: 'FTSE 100',
                price: 26.89,
                quantity: 47,
                value: 1263.83,
                gain: 133.62,
                returns: 0.0956,
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
            ],
          },
        } as any
      }
    />
  </div>
);
