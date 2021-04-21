import { Story, Meta } from '@storybook/react';
import OverviewStats from './OverviewStats';

export default {
  title: 'Molecules/OverviewStats',
  component: OverviewStats,
} as Meta;

const Template: Story<React.ComponentProps<typeof OverviewStats>> = (args) => (
  <OverviewStats {...args} />
);

export const ValueAndGain = Template.bind({});
ValueAndGain.args = {
  value: 23346.14,
  gain: 417.4,
};

export const FormatCurrency = Template.bind({});
FormatCurrency.args = {
  value: 23346.14,
  gain: 417.4,
  currency: 'GBP',
};

export const Returns = Template.bind({});
Returns.args = {
  value: 23346.14,
  gain: 417.4,
  returns: 0.125,
};

export const Negative = Template.bind({});
Negative.args = {
  value: 23346.14,
  gain: -417.4,
  returns: -0.125,
  currency: 'GBP',
};
