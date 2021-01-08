import styled from 'styled-components';
import { Story, Meta } from '@storybook/react';
import appleStock from '@visx/mock-data/lib/mocks/appleStock';
import Bars from './Bars';

const Container = styled.div`
  width: 70vw;
  height: 70vh;
`;

export default {
  title: 'Display/Bars',
  component: Bars,
  decorators: [(storyFn) => <Container>{storyFn()}</Container>],
} as Meta;

const Template: Story<React.ComponentProps<typeof Bars>> = (args) => (
  <Bars {...args} />
);

const stock = appleStock
  .slice(0, 6)
  .map((d) => [new Date(d.date), d.close] as const);

export const Default = Template.bind({});
Default.args = {
  data: stock,
};

export const FormatValue = Template.bind({});
FormatValue.args = {
  data: stock,
  formatValue: (val: number) => `$${val.toFixed(2)}`,
};
