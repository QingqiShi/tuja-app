import React from 'react';
import styled from 'styled-components/macro';
import { action } from '@storybook/addon-actions';
import DateInput from 'components/DateInput';

const Container = styled.div`
  width: 300px;
`;

const DateInputStories = {
  title: 'Inputs/DateInput',
  component: DateInput,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export default DateInputStories;

export const Demo = (args: any) => (
  <DateInput {...args} onChange={action('onChange')} />
);
Demo.args = {
  label: 'Date',
  helperText: 'Select a date using the native date picker.',
  required: true,
};
