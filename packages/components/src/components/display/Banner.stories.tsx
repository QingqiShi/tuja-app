import { Story, Meta } from '@storybook/react';
import Banner from './Banner';

export default {
  title: 'Display/Banner',
  component: Banner,
} as Meta;

const Template: Story<React.ComponentProps<typeof Banner>> = (args) => (
  <Banner {...args} />
);

export const Informational = Template.bind({});
Informational.args = {
  children: 'This is some informational banner message',
};

export const Error = Template.bind({});
Error.args = {
  children: 'This is banner to display some error message',
  variant: 'error',
};

export const InformationalWithAction = Template.bind({});
InformationalWithAction.args = {
  children: 'This is some informational banner message',
  action: {
    label: 'Acknowledge',
    onClick: () => {},
  },
};

export const ErrorWithAction = Template.bind({});
ErrorWithAction.args = {
  children: 'This is banner to display some error message',
  variant: 'error',
  action: {
    label: 'Dismiss',
    onClick: () => {},
  },
};
