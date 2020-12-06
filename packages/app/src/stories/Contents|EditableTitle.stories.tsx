import { action } from '@storybook/addon-actions';
import EditableTitle from 'components/EditableTitle';

const EditableTitleStories = {
  title: 'Contents/EditableTitle',
  component: EditableTitle,
};

export default EditableTitleStories;

export const Demo = () => (
  <EditableTitle
    defaultValue="My Portfolio"
    onChange={async () => action('title-changed')()}
  />
);
