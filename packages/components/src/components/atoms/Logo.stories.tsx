import { Story, Meta } from '@storybook/react';
import Logo from './Logo';

export default {
  title: 'Atoms/Logo',
  component: Logo,
} as Meta;

const Template: Story<React.ComponentProps<typeof Logo>> = () => <Logo />;

export const Example = Template.bind({});
Example.args = {};
