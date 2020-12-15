import { Story, Meta } from '@storybook/react';
import Modal from './Modal';

export default {
  title: 'Feedback/Modal',
  component: Modal,
} as Meta;

const Template: Story<React.ComponentProps<typeof Modal>> = (args) => (
  <Modal {...args} />
);

export const Default = Template.bind({});
Default.args = {
  children: <div>test</div>,
  padding: true,
  open: true,
};
