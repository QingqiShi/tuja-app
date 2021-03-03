import styled from 'styled-components/macro';
import { Type } from '@tuja/components';
import { Card } from 'commonStyledComponents';
import { theme } from 'theme';

const LayoutGrid = styled.div`
  width: 100%;
  text-align: left;
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto auto auto;
  grid-template-areas:
    'overview'
    'holdings'
    'autoInvest';
  grid-gap: ${theme.spacings('m')};

  @media (${theme.breakpoints.minLaptop}) {
    grid-template-columns: 500px 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      'overview holdings'
      'autoInvest holdings'
      '. holdings';
    grid-gap: ${theme.spacings('s')};
  }
`;

const Overview = styled(Card)`
  grid-area: overview;
`;

const Holdings = styled.div`
  h6 {
    margin-top: 0;
    margin-bottom: 1em;
  }
  grid-area: holdings;
`;

interface PortfolioListLayoutProps {
  overview: React.ReactNode;
  holdings: React.ReactNode;
}

function PortfolioListLayout({ overview, holdings }: PortfolioListLayoutProps) {
  return (
    <LayoutGrid>
      <Overview>{overview}</Overview>
      <Holdings>
        <Type scale="h6">Investments</Type>
        {holdings}
      </Holdings>
    </LayoutGrid>
  );
}

export default PortfolioListLayout;
