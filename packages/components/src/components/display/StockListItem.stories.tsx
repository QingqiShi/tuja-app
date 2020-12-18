import { Story, Meta } from '@storybook/react';
import StockListItem from './StockListItem';

export default {
  title: 'Display/StockListItem',
  component: StockListItem,
} as Meta;

const Template: Story<React.ComponentProps<typeof StockListItem>> = (args) => (
  <StockListItem {...args} />
);

export const Demo = Template.bind({});
Demo.args = {
  code: 'AAPL',
  exchange: 'US',
  name: 'Apple Ltd',
};
