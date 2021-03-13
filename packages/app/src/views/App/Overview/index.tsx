import { Helmet } from 'react-helmet-async';
import { EdgePadding } from '@tuja/components';
import useScrollToTopOnMount from 'hooks/useScrollToTopOnMount';
import { PortfolioProcessorProvider } from 'hooks/usePortfolioProcessor';
// import PortfolioDashboard from 'components/PortfolioDashboard';
import Portfolio from './Portfolio';

function Overview() {
  useScrollToTopOnMount();
  return (
    <EdgePadding>
      <Helmet>
        <title>Portfolio | Tuja App</title>
      </Helmet>
      <PortfolioProcessorProvider>
        <Portfolio />
      </PortfolioProcessorProvider>
    </EdgePadding>
  );
}

export default Overview;
