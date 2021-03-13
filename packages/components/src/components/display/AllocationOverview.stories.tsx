import { Story, Meta } from '@storybook/react';
import AllocationOverview from './AllocationOverview';

export default {
  title: 'Display/AllocationOverview',
  component: AllocationOverview,
} as Meta;

const Template: Story<React.ComponentProps<typeof AllocationOverview>> = (
  args
) => <AllocationOverview {...args} />;

export const Example = Template.bind({});
Example.args = {
  holdings: {
    'AAPL.US': { value: 100 },
    'IUSA.LSE': { value: 200 },
    'SPOT.US': { value: 50 },
  },
  cash: 5,
  currency: 'GBP',
};
