import { Story, Meta } from '@storybook/react';
import Footer from './Footer';

export default {
  title: 'Molecules/Footer',
  component: Footer,
} as Meta;

const Template: Story<React.ComponentProps<typeof Footer>> = (args) => (
  <Footer {...args} />
);

export const Example = Template.bind({});
Example.args = {
  links: [
    { label: 'Donate', href: '#' },
    { label: 'About', href: '#' },
  ],
};
