import { Story, Meta } from '@storybook/react';
import DateRangeTabs from './DateRangeTabs';

export default {
  title: 'Molecules/DateRangeTabs',
  component: DateRangeTabs,
} as Meta;

const Template: Story<React.ComponentProps<typeof DateRangeTabs>> = (args) => (
  <DateRangeTabs {...args} />
);

export const NoStartDate = Template.bind({});
NoStartDate.args = {};

export const LongRange = Template.bind({});
LongRange.args = {
  maxDate: new Date(1555332950299),
  value: new Date(1607558400000),
};
