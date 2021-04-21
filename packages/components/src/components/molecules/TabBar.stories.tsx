import { Story, Meta } from '@storybook/react';
import { House, Clock, Gear } from 'phosphor-react';
import TabBar from './TabBar';

export default {
  title: 'Molecules/TabBar',
  component: TabBar,
} as Meta;

const Template: Story<React.ComponentProps<typeof TabBar>> = (args) => (
  <TabBar {...args} />
);

export const Example = Template.bind({});
Example.args = {
  links: [
    { Icon: House, label: 'Overview', isActive: true },
    { Icon: Clock, label: 'Activities' },
    { Icon: Gear, label: 'Settings' },
  ],
};
