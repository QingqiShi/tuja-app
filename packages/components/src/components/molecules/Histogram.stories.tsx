import { Story, Meta } from '@storybook/react';
import styled from 'styled-components';
import Histogram from './Histogram';

const Container = styled.div`
  width: 100%;
  height: 70vh;
`;

export default {
  title: 'Molecules/Histogram',
  component: Histogram,
  decorators: [(storyFn) => <Container>{storyFn()}</Container>],
} as Meta;

const Template: Story<React.ComponentProps<typeof Histogram>> = (args) => (
  <Histogram {...args} />
);

const data = [
  10.83, -5.3, 16.31, 10.35, 8.84, 12.25, 12.72, 18.29, 16.54, 17.89, 2.3,
  16.56, 3.16, 23.27, 2.3, 9.67, 7.3, 3.88, 1.5, 6.57, -2.82, 16.96, 1.65,
  13.21, 6.93, 12.07, 1.7, -2.92, 10.26, 3.63, -4.18, 3.04, 3.32, 2.9, 0.25,
  11.11, 4.38, 11.55, 13.34, -2.59,
];

export const Example = Template.bind({});
Example.args = {
  data,
};

export const Bounds = Template.bind({});
Bounds.args = {
  data,
  xMin: -50,
  xMax: 50,
  yMax: 0.6,
  binCount: 10,
  formatValue: (val) => `${Math.round(val)}%`,
};

export const BoundsExtended = Template.bind({});
BoundsExtended.args = {
  data,
  xMin: 0,
  xMax: 20,
  yMax: 0.3,
  binCount: 8,
  formatValue: (val) => `${Math.round(val * 10) / 10}%`,
};
