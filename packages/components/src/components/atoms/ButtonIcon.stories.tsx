import { Story, Meta } from '@storybook/react';
import { XCircle } from 'phosphor-react';
import ButtonIcon from './ButtonIcon';

export default {
  title: 'Atoms/ButtonIcon',
  component: ButtonIcon,
} as Meta;

const Template: Story<React.ComponentProps<typeof ButtonIcon>> = (args) => (
  <ButtonIcon {...args} />
);

export const Example = Template.bind({});
Example.args = {
  children: <XCircle />,
};
