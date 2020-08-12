import React from 'react';
import styled from 'styled-components/macro';
import appleStock from '@vx/mock-data/lib/mocks/appleStock';
import Chart from 'components/Chart';

const Container = styled.div`
  width: 70vw;
  height: 70vh;
`;

const ChartStories = {
  title: 'Display/Chart',
  component: Chart,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: {
    currency: {
      control: { type: 'inline-radio', options: ['GBP', 'USD'] },
    },
  },
};

export default ChartStories;

const stock = appleStock
  .slice(0, 360)
  .map((d) => [new Date(d.date), d.close] as const);

const benchmark = appleStock
  .slice(360, 720)
  .map((d, i) => [stock[i][0], d.close] as const);

export const Demo = (args: any) => <Chart {...args} data={stock} />;
Demo.args = {
  hideAxis: false,
  hideTooltip: false,
  formatPercentage: false,
  currency: 'GBP',
};

export const HideAxisAndTooltip = () => (
  <Chart data={stock} hideAxis hideTooltip />
);

export const Benchmark = () => <Chart data={stock} benchmark={benchmark} />;
