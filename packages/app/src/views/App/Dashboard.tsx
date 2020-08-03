import React from 'react';
import styled from 'styled-components/macro';
import Type from 'components/Type';
import Button from 'components/Button';
import PortfolioDashboard from 'components/PortfolioDashboard';
import CreatePortfolio from 'components/CreatePortfolio';
import { TitleRow } from 'commonStyledComponents';
import useAuth from 'hooks/useAuth';
import usePortfolio from 'hooks/usePortfolio';
import { createPortfolio } from 'libs/portfolio';
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
  const { state, currentUser } = useAuth();
  const { portfolio } = usePortfolio();

  if (isDemo) {
    return (
      <Container>
        <TitleRow>
          <Type scale="h3">Dashboard</Type>
          <Button variant="shout" onClick={onSignIn}>
            Make Your Own
          </Button>
        </TitleRow>
        <PortfolioDashboard />
      </Container>
    );
  }

  return (
    <Container>
      {state === 'SIGNED_IN' && currentUser && !portfolio && (
        <CreatePortfolio
          onCreate={(name, currency) =>
            createPortfolio(name, currency, currentUser.uid)
          }
        />
      )}
      {state === 'SIGNED_IN' && portfolio && (
        <>
          <TitleRow>
            <Type scale="h3">Dashboard</Type>
          </TitleRow>
          <PortfolioDashboard />
        </>
      )}
    </Container>
  );
}

export default Dashboard;
