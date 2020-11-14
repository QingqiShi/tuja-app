import React from 'react';
import { Story, Meta } from '@storybook/react';
import TopLinearLoader from '../../components/TopLinearLoader';

export default {
  title: 'Feedback/TopLinearLoader',
  component: TopLinearLoader,
} as Meta;

const Template: Story<React.ComponentProps<typeof TopLinearLoader>> = (
  args
) => <TopLinearLoader {...args} />;

export const Default = Template.bind({});
Default.args = {};
