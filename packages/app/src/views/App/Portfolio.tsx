import React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components/macro';
import { Type } from '@tuja/components';
import PortfolioDashboard from 'components/PortfolioDashboard';
import { TitleRow } from 'commonStyledComponents';
import { theme } from 'theme';

const Container = styled.div`
  padding: ${theme.spacings('s')} ${theme.spacings('xs')};

  @media (${theme.breakpoints.minTablet}) {
    padding: ${theme.spacings('s')};
  }

  @media (${theme.breakpoints.minLaptop}) {
    padding: ${theme.spacings('m')};
  }

  @media (${theme.breakpoints.minDesktop}) {
    padding: ${theme.spacings('l')};
    max-width: 1920px;
    margin-left: auto;
    margin-right: auto;
  }
`;

interface DashboardProps {
  onSignIn: () => void;
  isDemo?: boolean;
}

function Dashboard({ onSignIn, isDemo }: DashboardProps) {
  return (
    <Container>
      <Helmet>
        <title>Portfolio | Tuja App</title>
      </Helmet>
      <TitleRow>
        <Type scale="h3">Portfolio</Type>
      </TitleRow>
      <PortfolioDashboard isDemo={isDemo} onSignIn={onSignIn} />
    </Container>
  );
}

export default Dashboard;
