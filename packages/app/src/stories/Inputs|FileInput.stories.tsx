import React from 'react';
import styled from 'styled-components/macro';
import { action } from '@storybook/addon-actions';
import { withKnobs, text } from '@storybook/addon-knobs';
import FileInput from 'components/FileInput';

const Container = styled.div`
  width: 300px;
`;

const FileInputStories = {
  title: 'Inputs|FileInput',
  component: FileInput,
  decorators: [withKnobs, (storyFn: any) => <Container>{storyFn()}</Container>],
};

export default FileInputStories;

export const Demo = () => (
  <FileInput
    label={text('Label', 'Historic data')}
    helperText={text('Helper text', 'Only accepts .csv files')}
    onFile={action('onFile')}
    accept={text('Accept', '.csv')}
  />
);

export const WithLabel = () => <FileInput label="Upload your life" />;

export const WithHelperText = () => (
  <FileInput helperText="Only accepts csv files" />
);
