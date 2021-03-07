import { Story, Meta } from '@storybook/react';
import EdgePadding from './EdgePadding';
import { v } from '../../theme';

export default {
  title: 'Layout/EdgePadding',
  component: EdgePadding,
} as Meta;

const Template: Story<React.ComponentProps<typeof EdgePadding>> = (args) => (
  <EdgePadding {...args} />
);

export const Example = Template.bind({});
Example.args = {
  children: (
    <div
      style={{
        backgroundColor: v.textGain,
      }}
    >
      test
    </div>
  ),
};
Example.parameters = { layout: 'fullscreen' };
