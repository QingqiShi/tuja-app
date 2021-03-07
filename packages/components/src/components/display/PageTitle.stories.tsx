import { Story, Meta } from '@storybook/react';
import PageTitle from './PageTitle';

export default {
  title: 'Display/Text/PageTitle',
  component: PageTitle,
} as Meta;

const Template: Story<React.ComponentProps<typeof PageTitle>> = (args) => (
  <PageTitle {...args} />
);

export const OnlyTitle = Template.bind({});
OnlyTitle.args = {
  children: 'Overview',
};

export const WithBackButton = Template.bind({});
WithBackButton.args = {
  children: 'Trading212',
  backButtonLabel: 'Overview',
  backHref: '#',
};
