import { Helmet } from 'react-helmet-async';
import useScrollToTopOnMount from '../../../hooks/useScrollToTopOnMount';
import { PortfolioProcessorProvider } from '../../../hooks/usePortfolioProcessor';
import Portfolio from './Portfolio';

interface OverviewProps {
  isDemo?: boolean;
}

function Overview({ isDemo }: OverviewProps) {
  useScrollToTopOnMount();
  return (
    <>
      <Helmet>
        <title>Portfolio | Tuja App</title>
      </Helmet>
      <PortfolioProcessorProvider>
        <Portfolio isDemo={isDemo} />
      </PortfolioProcessorProvider>
    </>
  );
}

export default Overview;
