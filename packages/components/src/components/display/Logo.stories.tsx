import { Story, Meta } from '@storybook/react';
import Logo from './Logo';

export default {
  title: 'Display/Logo',
  component: Logo,
} as Meta;

const Template: Story<React.ComponentProps<typeof Logo>> = () => <Logo />;

export const Demo = Template.bind({});
Demo.args = {};
