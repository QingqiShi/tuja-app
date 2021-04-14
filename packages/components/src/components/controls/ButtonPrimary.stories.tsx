import { Story, Meta } from '@storybook/react';
import ButtonPrimary from './ButtonPrimary';

export default {
  title: 'Controls/Buttons/ButtonPrimary',
  component: ButtonPrimary,
} as Meta;

const Template: Story<React.ComponentProps<typeof ButtonPrimary>> = (args) => (
  <ButtonPrimary {...args} />
);

export const Example = Template.bind({});
Example.args = {
  children: 'Get started',
};
