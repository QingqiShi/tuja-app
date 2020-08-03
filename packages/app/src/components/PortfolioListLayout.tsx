import React from 'react';
import styled from 'styled-components/macro';
import Type from 'components/Type';
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

const AutoInvest = styled(Card)`
  grid-area: autoInvest;
  h6 {
    margin-top: 0;
    margin-bottom: 1em;
  }
`;

interface PortfolioListLayoutProps {
  overview: React.ReactNode;
  autoInvest: React.ReactNode;
  holdings: React.ReactNode;
}

function PortfolioListLayout({
  overview,
  autoInvest,
  holdings,
}: PortfolioListLayoutProps) {
  return (
    <LayoutGrid>
      <Overview>{overview}</Overview>
      <Holdings>
        <Type scale="h6">Investments</Type>
        {holdings}
      </Holdings>
      <AutoInvest>
        <Type scale="h6">Auto Invest</Type>
        {autoInvest}
      </AutoInvest>
    </LayoutGrid>
  );
}

export default PortfolioListLayout;
