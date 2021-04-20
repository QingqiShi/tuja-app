import { Story, Meta } from '@storybook/react';
import FormattedInput from './FormattedInput';

export default {
  title: 'Atoms/FormattedInput',
  component: FormattedInput,
} as Meta;

const Template: Story<React.ComponentProps<typeof FormattedInput>> = (args) => (
  <FormattedInput {...args} />
);

export const ActLikeTextInput = Template.bind({});
ActLikeTextInput.args = {
  label: 'Email',
  placeholder: 'hi@example.com',
  helperText: 'We will never share your email address.',
  type: 'email',
  required: false,
};

export const FormatValue = Template.bind({});
FormatValue.args = {
  label: 'Number',
  format: (x: any) => x.toString(),
  parse: (raw: string) => {
    const parsed = Number(raw);
    if (isNaN(parsed)) return null;
    return parsed;
  },
};

export const ExternalValue = Template.bind({});
ExternalValue.args = {
  value: 12345,
  format: (x: any) => x.toString(),
  parse: (raw: string) => {
    const parsed = Number(raw);
    if (isNaN(parsed)) return null;
    return parsed;
  },
};
