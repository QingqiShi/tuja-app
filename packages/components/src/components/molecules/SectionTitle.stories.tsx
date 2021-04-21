import { Story, Meta } from '@storybook/react';
import SectionTitle from './SectionTitle';

export default {
  title: 'Molecules/SectionTitle',
  component: SectionTitle,
} as Meta;

const Template: Story<React.ComponentProps<typeof SectionTitle>> = (args) => (
  <SectionTitle {...args} />
);

export const Example = Template.bind({});
Example.args = {
  children: 'Holdings',
};
