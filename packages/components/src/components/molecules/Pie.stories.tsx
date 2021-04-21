import styled from 'styled-components';
import { Story, Meta } from '@storybook/react';
import Pie from './Pie';

const Container = styled.div`
  width: 70vw;
  height: 70vh;
`;

export default {
  title: 'Molecules/Pie',
  component: Pie,
  decorators: [(storyFn) => <Container>{storyFn()}</Container>],
} as Meta;

const Template: Story<React.ComponentProps<typeof Pie>> = (args) => (
  <Pie {...args} />
);

export const Slices = Template.bind({});
Slices.args = {
  primaryText: '£1,234.56',
  secondaryText: 'Total Value',
  data: [
    { label: 'A', percentage: 0.4 },
    { label: 'B', percentage: 0.3 },
    { label: 'C', percentage: 0.2 },
    { label: 'E', percentage: 0.05 },
    { label: 'F', percentage: 0.025 },
    { label: 'G', percentage: 0.025 },
  ],
};

export const WithColors = Template.bind({});
WithColors.args = {
  primaryText: '£1,234.56',
  secondaryText: 'Total Value',
  data: [
    { label: 'A', percentage: 0.4, color: '#556480' },
    { label: 'B', percentage: 0.3, color: '#CF9F97' },
    { label: 'C', percentage: 0.2, color: '#9DAECC' },
    { label: 'E', percentage: 0.05, color: '#B8CC89' },
    { label: 'F', percentage: 0.025, color: '#75805C' },
    { label: 'G', percentage: 0.025 },
  ],
};
