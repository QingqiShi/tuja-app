import { Story, Meta } from '@storybook/react';
import { CalendarBlank, Crosshair, ChartLine, Share } from 'phosphor-react';
import Benefits from './Benefits';

export default {
  title: 'Molecules/Benefits',
  component: Benefits,
} as Meta;

const Template: Story<React.ComponentProps<typeof Benefits>> = (args) => (
  <Benefits {...args} />
);

export const Example = Template.bind({});
Example.args = {
  title: 'Features',
  benefits: [
    {
      icon: <CalendarBlank />,
      name: 'Backtesting',
      description:
        'See how well your portfolio would have done using historical data.',
    },
    {
      icon: <Crosshair />,
      name: 'Optimisation',
      description:
        'Use the efficient frontier to get the best risk adjusted returns.',
    },
    {
      icon: <ChartLine />,
      name: 'Visualisation',
      description:
        'Visualise your portfolio to see how it performs over the long term.',
    },
    {
      icon: <Share />,
      name: 'Sharing',
      description:
        'You can share your investment thesis by exporting your results to beautifully generated reports.',
    },
  ],
};
