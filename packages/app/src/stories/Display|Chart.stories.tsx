import React from 'react';
import styled from 'styled-components/macro';
import { withKnobs, boolean } from '@storybook/addon-knobs';
import appleStock from '@vx/mock-data/lib/mocks/appleStock';
import Chart from 'components/Chart';

const Container = styled.div`
  width: 70vw;
  height: 70vh;
`;

export default {
  title: 'Display|Chart',
  component: Chart,
  decorators: [withKnobs],
};

const stock = appleStock
  .slice(0, 360)
  .map((d) => [new Date(d.date), d.close] as const);

const benchmark = appleStock
  .slice(360, 720)
  .map((d, i) => [stock[i][0], d.close] as const);

export const Demo = () => (
  <Container>
    <Chart
      data={stock}
      hideAxis={boolean('Hide axis', false)}
      hideTooltip={boolean('Hide tooltip', false)}
    />
  </Container>
);

export const HideAxisAndTooltip = () => (
  <Container>
    <Chart data={stock} hideAxis hideTooltip />
  </Container>
);

export const Benchmark = () => (
  <Container>
    <Chart data={stock} benchmark={benchmark} />
  </Container>
);
