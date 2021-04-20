import { Story, Meta } from '@storybook/react';
import ButtonTertiary from './ButtonTertiary';

export default {
  title: 'Atoms/ButtonTertiary',
  component: ButtonTertiary,
} as Meta;

const Template: Story<React.ComponentProps<typeof ButtonTertiary>> = (args) => (
  <ButtonTertiary {...args} />
);

export const Example = Template.bind({});
Example.args = {
  children: 'Get started',
};

export const AsAnchor = Template.bind({});
AsAnchor.args = {
  children: 'Get started',
  href: '/test',
};
