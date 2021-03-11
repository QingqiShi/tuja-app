import { Story, Meta } from '@storybook/react';
import DropdownMenu from './DropdownMenu';

export default {
  title: 'Controls/DropdownMenu',
  component: DropdownMenu,
} as Meta;

const Template: Story<React.ComponentProps<typeof DropdownMenu>> = (args) => (
  <div>
    <DropdownMenu {...args} />
    <button>test</button>
  </div>
);

export const Example = Template.bind({});
Example.args = {
  value: 'a',
  options: [
    { value: 'a', label: 'Test 1' },
    { value: 'b', label: 'Test 2' },
  ],
};

export const MenuRightAlign = Template.bind({});
MenuRightAlign.args = {
  align: 'right',
  value: 'a',
  options: [
    { value: 'a', label: 'Test 1' },
    { value: 'b', label: 'Test 2' },
  ],
};
