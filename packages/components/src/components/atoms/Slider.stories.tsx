import { useState } from 'react';
import { Story, Meta } from '@storybook/react';
import Slider from './Slider';

export default {
  title: 'Atoms/Slider',
  component: Slider,
} as Meta;

const Template: Story<React.ComponentProps<typeof Slider>> = (args) => (
  <Slider {...args} />
);

export const Example = Template.bind({});
Example.args = {};

const StatefulTemplate: Story<React.ComponentProps<typeof Slider>> = (args) => {
  const [value, setValue] = useState(0);
  return (
    <div>
      <Slider {...args} value={value} onChange={setValue} />
      <div>{value.toFixed(1)}</div>
    </div>
  );
};

export const Stateful = StatefulTemplate.bind({});
Stateful.args = {
  min: 0,
  max: 100,
  stepCount: 100,
};
