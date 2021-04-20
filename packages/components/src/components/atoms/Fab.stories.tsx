import { Story, Meta } from '@storybook/react';
import Fab from './Fab';

export default {
  title: 'Atoms/Fab',
  component: Fab,
} as Meta;

const Template: Story<React.ComponentProps<typeof Fab>> = (args) => (
  <Fab {...args} />
);

export const Example = Template.bind({});
Example.args = {};
