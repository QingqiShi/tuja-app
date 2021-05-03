import { Story, Meta } from '@storybook/react';
import Modal from './Modal';

export default {
  title: 'Molecules/Modal',
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

export const WithScrollableNestedElement = Template.bind({});
WithScrollableNestedElement.args = {
  children: (
    <div>
      <div
        style={{ maxHeight: '3rem', overflowY: 'scroll' }}
        className="allow-scroll"
      >
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, saepe
        nobis. Est dignissimos neque quos animi ab molestias assumenda? Fugiat
        sit cum minima porro perspiciatis magni ipsa hic vel pariatur!
      </div>
    </div>
  ),
  padding: true,
  open: true,
};
