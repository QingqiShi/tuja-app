import { Story, Meta } from '@storybook/react';
import Cta from './Cta';

export default {
  title: 'Atoms/Cta',
  component: Cta,
} as Meta;

const Template: Story<React.ComponentProps<typeof Cta>> = (args) => (
  <Cta {...args} />
);

export const Example = Template.bind({});
Example.args = {
  children: 'Get started',
};
