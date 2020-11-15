import React from 'react';
import styled from 'styled-components';
import { Story, Meta } from '@storybook/react';
import appleStock from '@visx/mock-data/lib/mocks/appleStock';
import Chart from './Chart';

const Container = styled.div`
  width: 70vw;
  height: 70vh;
`;

export default {
  title: 'Display/Chart',
  component: Chart,
  decorators: [(storyFn) => <Container>{storyFn()}</Container>],
} as Meta;

const Template: Story<React.ComponentProps<typeof Chart>> = (args) => (
  <Chart {...args} />
);

const stock = appleStock
  .slice(0, 360)
  .map((d) => [new Date(d.date), d.close] as const);

const benchmark = appleStock
  .slice(360, 720)
  .map((d, i) => [stock[i][0], d.close] as const);

export const Default = Template.bind({});
Default.args = {
  data: stock,
};

export const HideAxisAndTooltip = Template.bind({});
HideAxisAndTooltip.args = {
  hideAxis: true,
  hideTooltip: true,
  data: stock,
};

export const WithBenchmark = Template.bind({});
WithBenchmark.args = {
  data: stock,
  benchmark,
};

export const FormatValue = Template.bind({});
FormatValue.args = {
  data: stock,
  benchmark,
  formatValue: (val: number) => `$${val.toFixed(2)}`,
};
