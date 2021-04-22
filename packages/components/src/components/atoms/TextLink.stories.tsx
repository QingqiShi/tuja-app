import { Story, Meta } from '@storybook/react';
import TextLink from './TextLink';

export default {
  title: 'Atoms/TextLink',
  component: TextLink,
} as Meta;

const Template: Story<React.ComponentProps<typeof TextLink>> = (args) => (
  <TextLink {...args} />
);

export const Example = Template.bind({});
Example.args = {
  children: 'test link',
  href: '#',
};
