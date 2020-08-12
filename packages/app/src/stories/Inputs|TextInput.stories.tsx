import React from 'react';
import styled from 'styled-components/macro';
import TextInput from 'components/TextInput';

const Container = styled.div`
  width: 300px;
`;

const TextInputStories = {
  title: 'Inputs/TextInput',
  component: TextInput,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: {
    type: {
      control: { type: 'select', options: ['email', 'password'] },
    },
  },
};

export default TextInputStories;

export const Demo = (args: any) => <TextInput {...args} />;
Demo.args = {
  label: 'Email',
  placeholder: 'hi@example.com',
  helperText: 'We will never share your email address.',
  type: 'email',
  required: false,
};

export const WithPlaceholder = () => <TextInput placeholder="Email" />;

export const WithLabel = () => <TextInput label="Email" />;

export const WithHelperText = () => (
  <TextInput helperText="Some helper text." />
);

export const Disabled = () => <TextInput value="qingqishi@live.com" disabled />;

export const Required = () => <TextInput label="Email" required />;

export const Invalid = () => (
  <TextInput type="email" label="Email" defaultValue="testtest" />
);
