import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { CalendarBlank, ChartLine, Crosshair, Share } from 'phosphor-react';
import {
  Benefits,
  ButtonSecondary,
  Cta,
  EconomyAnalysis,
  Footer,
  Header,
  Hero,
  v,
} from '@tuja/components';
import useScrollToTopOnMount from '../hooks/useScrollToTopOnMount';

const ContentContainer = styled.div`
  min-height: calc(100vh - 10rem - ${v.headerHeight});
`;

function Home() {
  useScrollToTopOnMount();
  const history = useHistory();
  return (
    <div>
      <Helmet>
        <title>Tuja App | Portfolio Tracker</title>
      </Helmet>
      <Header
        logoHref="/"
        onLogoClick={() => history.push('/')}
        navigation={
          <>
            <ButtonSecondary
              href="/analytics"
              onClick={() => history.push('/analytics')}
            >
              Go to App
            </ButtonSecondary>
          </>
        }
      />
      <ContentContainer>
        <Hero
          headline="Understand your investments."
          cta={
            <Cta href="/analytics" onClick={() => history.push('/analytics')}>
              Try for free
            </Cta>
          }
          image={<EconomyAnalysis />}
        />
        <Benefits
          title="Features"
          benefits={[
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
                'Use tools like the efficient frontier to find the allocation to give you the best risk adjusted returns.',
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
          ]}
        />
      </ContentContainer>

      <Footer
        links={[
          { label: 'Portfolio Tracker', href: '/tracker' },
          // { label: 'Help us out', href: '/donation' },
          // { label: 'About Us', href: '/about' },
        ]}
      />
    </div>
  );
}

export default Home;
