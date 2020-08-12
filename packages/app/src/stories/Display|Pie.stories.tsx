import React from 'react';
import styled from 'styled-components/macro';
import Pie from 'components/Pie';

const Container = styled.div`
  width: 70vw;
  height: 70vh;
`;

const PieStories = {
  title: 'Display/Pie',
  component: Pie,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export default PieStories;

export const Demo = (args: any) => (
  <Pie
    {...args}
    data={[
      { label: 'A', percentage: 0.4 },
      { label: 'B', percentage: 0.3 },
      { label: 'C', percentage: 0.2 },
      { label: 'E', percentage: 0.05 },
      { label: 'F', percentage: 0.025 },
      { label: 'G', percentage: 0.025 },
    ]}
  />
);
Demo.args = {
  primaryText: '£1,234.56',
  secondaryText: 'Total Value',
};
