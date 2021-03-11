import { Story, Meta } from '@storybook/react';
import ButtonSecondary from './ButtonSecondary';

export default {
  title: 'Controls/Buttons/ButtonSecondary',
  component: ButtonSecondary,
} as Meta;

const Template: Story<React.ComponentProps<typeof ButtonSecondary>> = (
  args
) => <ButtonSecondary {...args} />;

export const Example = Template.bind({});
Example.args = {
  children: 'Get started',
};
