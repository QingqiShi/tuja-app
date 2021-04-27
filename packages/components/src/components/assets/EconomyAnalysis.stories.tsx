import { Story, Meta } from '@storybook/react';
import EconomyAnalysis from './EconomyAnalysis';

export default {
  title: 'Assets/EconomyAnalysis',
  component: EconomyAnalysis,
} as Meta;

const Template: Story<React.ComponentProps<typeof EconomyAnalysis>> = (
  args
) => <EconomyAnalysis {...args} />;

export const Example = Template.bind({});
Example.args = {};
