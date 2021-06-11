import { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import AllocationItem from './AllocationItem';

export default {
  title: 'Molecules/AllocationItem',
  component: AllocationItem,
} as Meta;

const Template: Story<React.ComponentProps<typeof AllocationItem>> = (args) => (
  <AllocationItem {...args} />
);

export const Example = Template.bind({});
Example.args = {
  stockInfo: {
    name: 'Apple Ltd.',
    code: 'AAPL',
    exchange: 'US',
  },
  allocation: 23,
};

export const Stateful = () => {
  const [value, setValue] = useState(0);
  return (
    <AllocationItem
      stockInfo={{
        name: 'Apple Ltd.',
        code: 'AAPL',
        exchange: 'US',
      }}
      allocation={value}
      onChange={setValue}
    />
  );
};
