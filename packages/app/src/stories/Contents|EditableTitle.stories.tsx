import React from 'react';
import { action } from '@storybook/addon-actions';
import EditableTitle from 'components/EditableTitle';

export default {
  title: 'Contents|EditableTitle',
  component: EditableTitle,
};

export const Demo = () => (
  <EditableTitle
    value="My Portfolio"
    onChange={async () => action('title-changed')()}
  />
);
