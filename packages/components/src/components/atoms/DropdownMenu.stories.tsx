import { Story, Meta } from '@storybook/react';
import DropdownMenu from './DropdownMenu';

export default {
  title: 'Atoms/DropdownMenu',
  component: DropdownMenu,
} as Meta;

const Template: Story<React.ComponentProps<typeof DropdownMenu>> = (args) => (
  <DropdownMenu {...args} />
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

export const TabThrough = (((args) => (
  <div>
    <p>
      Use keyboard navigation to open the dropdown, then tab through the items,
      until you reach the end to close the menu and move onto the next element.
    </p>
    <DropdownMenu {...args} />
    <button>test</button>
  </div>
)) as Story<React.ComponentProps<typeof DropdownMenu>>).bind({});
TabThrough.args = {
  value: 'a',
  options: [
    { value: 'a', label: 'Test 1' },
    { value: 'b', label: 'Test 2' },
  ],
};
