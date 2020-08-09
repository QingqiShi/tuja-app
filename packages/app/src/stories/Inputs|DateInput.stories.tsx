import React from 'react';
import styled from 'styled-components/macro';
import { action } from '@storybook/addon-actions';
import { withKnobs, boolean, text } from '@storybook/addon-knobs';
import DateInput from 'components/DateInput';

const Container = styled.div`
  width: 300px;
`;

const DateInputStories = {
  title: 'Inputs|DateInput',
  component: DateInput,
  decorators: [withKnobs, (storyFn: any) => <Container>{storyFn()}</Container>],
};

export default DateInputStories;

export const Demo = () => (
  <DateInput
    onChange={action('onChange')}
    label={text('Label', 'Date')}
    helperText={text(
      'Helper Text',
      'Select a date using the native date picker.'
    )}
    required={boolean('Required', true)}
  />
);
