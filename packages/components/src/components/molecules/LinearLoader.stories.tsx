import { Story, Meta } from '@storybook/react';
import LinearLoader from './LinearLoader';

export default {
  title: 'Molecules/LinearLoader',
  component: LinearLoader,
} as Meta;

const Template: Story<React.ComponentProps<typeof LinearLoader>> = (args) => (
  <LinearLoader {...args} />
);

export const Default = Template.bind({});
Default.args = {};
