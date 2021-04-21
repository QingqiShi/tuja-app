import { Story, Meta } from '@storybook/react';
import TopLinearLoader from './TopLinearLoader';

export default {
  title: 'Molecules/TopLinearLoader',
  component: TopLinearLoader,
} as Meta;

const Template: Story<React.ComponentProps<typeof TopLinearLoader>> = (
  args
) => <TopLinearLoader {...args} />;

export const Default = Template.bind({});
Default.args = {};
