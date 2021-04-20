import { Story, Meta } from '@storybook/react';
import appleStock from '@visx/mock-data/lib/mocks/appleStock';
import InvestmentItem from './InvestmentItem';

const stock = appleStock
  .slice(0, 360)
  .map((d) => [new Date(d.date), d.close] as const);

export default {
  title: 'Display/InvestmentItem',
  component: InvestmentItem,
} as Meta;

const Template: Story<React.ComponentProps<typeof InvestmentItem>> = (args) => (
  <InvestmentItem {...args} />
);

export const Demo = Template.bind({});
Demo.args = {
  code: 'AAPL',
  name: 'Apple Ltd',
  chartData: stock,
  changePercentage: 1.51,
  additional: '+£123.45',
};
