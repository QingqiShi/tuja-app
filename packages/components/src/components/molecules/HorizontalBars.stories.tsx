import { Story, Meta } from '@storybook/react';
import HorizontalBars from './HorizontalBars';

export default {
  title: 'Molecules/HorizontalBars',
  component: HorizontalBars,
} as Meta;

const Template: Story<React.ComponentProps<typeof HorizontalBars>> = (args) => (
  <HorizontalBars {...args} />
);

export const Example = Template.bind({});
Example.args = {
  data: [
    { id: 'A', value: 40 },
    { id: 'B', value: 60 },
  ],
};

export const SetTotal = Template.bind({});
SetTotal.args = {
  data: [
    { id: 'A', value: 40 },
    { id: 'B', value: 60 },
  ],
  total: 200,
};
