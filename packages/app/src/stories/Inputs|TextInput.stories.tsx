import React from 'react';
import styled from 'styled-components/macro';
import { withKnobs, select, boolean, text } from '@storybook/addon-knobs';
import TextInput from 'components/TextInput';

const Container = styled.div`
  width: 300px;
`;

export default {
  title: 'Inputs|TextInput',
  component: TextInput,
  decorators: [withKnobs, (storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Demo = () => (
  <TextInput
    label={text('Label', 'Email') || undefined}
    placeholder={text('Placeholder', 'hi@example.com') || undefined}
    helperText={
      text('Helper Text', 'We will never share your email address.') ||
      undefined
    }
    type={select('Type', { Email: 'email', Password: 'password' }, 'email')}
    required={boolean('Required', false)}
  />
);

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
