import { Story, Meta } from '@storybook/react';
import ResponsiveSplit from './ResponsiveSplit';
import { v } from '../../theme';

export default {
  title: 'Layout/ResponsiveSplit',
  component: ResponsiveSplit,
} as Meta;

const Template: Story<React.ComponentProps<typeof ResponsiveSplit>> = (
  args
) => <ResponsiveSplit {...args} />;

export const Example = Template.bind({});
Example.args = {
  primary: (
    <div
      style={{
        height: '500px',
        backgroundColor: v.textGain,
      }}
    />
  ),
  secondary: (
    <div
      style={{
        height: '1000px',
        backgroundColor: v.textLoss,
      }}
    />
  ),
};
Example.parameters = { layout: 'fullscreen' };
