import { Story, Meta } from '@storybook/react';
import appleStock from '@visx/mock-data/lib/mocks/appleStock';
import { Chart, NumberInput } from '../..';
import AnalysisContainer from './AnalysisContainer';

const stock = appleStock
  .slice(0, 360)
  .map((d) => [new Date(d.date), d.close] as const);

export default {
  title: 'Molecules/AnalysisContainer',
  component: AnalysisContainer,
} as Meta;

const Template: Story<React.ComponentProps<typeof AnalysisContainer>> = (
  args
) => <AnalysisContainer {...args} />;

export const Example = Template.bind({});
Example.args = {
  title: 'Backtest',
  configuration: (
    <div>
      <NumberInput label="Starting amount" defaultValue={10000} />
    </div>
  ),
  chart: <Chart data={stock} />,
};

export const Loading = Template.bind({});
Loading.args = {
  title: 'Backtest',
  chart: <Chart data={[]} />,
  isLoading: true,
};
