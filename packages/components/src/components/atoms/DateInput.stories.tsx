import { Story, Meta } from '@storybook/react';
import DateInput from './DateInput';

export default {
  title: 'Atoms/DateInput',
  component: DateInput,
} as Meta;

const Template: Story<React.ComponentProps<typeof DateInput>> = (args) => (
  <DateInput {...args} />
);

export const Default = Template.bind({});
Default.args = {};

export const WithLabel = Template.bind({});
WithLabel.args = {
  label: 'Date',
};

export const WithHelperText = Template.bind({});
WithHelperText.args = {
  helperText: 'Some helper text.',
};

export const Required = Template.bind({});
Required.args = {
  label: 'Date',
  required: true,
};

export const ExternalValue = Template.bind({});
ExternalValue.args = {
  label: 'Date',
  value: new Date(),
};
