import styled from 'styled-components/macro';
import { action } from '@storybook/addon-actions';
import { PortfolioContext } from 'hooks/usePortfolio';
import InvestmentsListItem from 'components/InvestmentsListItem';

const Container = styled.div`
  text-align: left;
  width: 500px;
`;

const InvestmentsTableStories = {
  title: 'Contents/InvestmentsListItem',
  component: InvestmentsListItem,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: {
    mode: {
      control: {
        type: 'inline-radio',
        options: ['GAIN', 'VALUE', 'ALLOCATION', 'TODAY'],
      },
    },
  },
};

export default InvestmentsTableStories;

export const Demo = (args: any) => (
  <PortfolioContext.Provider
    value={{
      portfolio: { currency: 'GBP', aliases: {} } as any,
      loaded: true,
      portfolios: [],
      handleChangePortfolio: () => {},
    }}
  >
    <InvestmentsListItem {...args} onToggle={action('onToggle')} />
  </PortfolioContext.Provider>
);
Demo.args = {
  mode: 'GAIN',
  ticker: 'AAPL',
  color: '#556480',
  portfolioValue: 200,
  holdingPerformance: {
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
};
