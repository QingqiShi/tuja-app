import styled from 'styled-components/macro';
import { action } from '@storybook/addon-actions';
import FileInput from 'components/FileInput';

const Container = styled.div`
  width: 300px;
`;

const FileInputStories = {
  title: 'Inputs/FileInput',
  component: FileInput,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export default FileInputStories;

export const Demo = (args: any) => (
  <FileInput onFile={action('onFile')} {...args} />
);
Demo.args = {
  label: 'Historic data',
  helperText: 'Only accepts .csv files',
  accept: '.csv',
};

export const WithLabel = () => <FileInput label="Upload your life" />;

export const WithHelperText = () => (
  <FileInput helperText="Only accepts csv files" />
);
