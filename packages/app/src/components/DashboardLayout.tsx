import React from 'react';
import styled from 'styled-components/macro';
import { theme } from 'theme';

const FlexLayout = styled.div`
  width: 100%;
  text-align: left;

  @media (${theme.breakpoints.minTablet}) {
    position: relative;
    display: flex;
    align-items: flex-start;
  }
`;

const Side = styled.div`
  margin-bottom: ${theme.spacings('xs')};

  @media (${theme.breakpoints.minTablet}) {
    margin-bottom: 0;
    width: 16rem;
    position: sticky;
    max-height: calc(100vh - 5rem);
    padding: 1px;
    top: calc(5rem + ${theme.spacings('s')});
  }
  @media (${theme.breakpoints.minLaptop}) {
    width: 20rem;
  }
`;

const Main = styled.div`
  @media (${theme.breakpoints.minTablet}) {
    flex-grow: 1;
    flex-basis: 0;
    width: 0;
    padding: 1px;
    margin-left: ${theme.spacings('s')};
  }
`;

interface DashboardLayoutProps {
  top: React.ReactNode;
  side: React.ReactNode;
  main: React.ReactNode;
}

function DashboardLayout({ top, side, main }: DashboardLayoutProps) {
  return (
    <div>
      <div>{top}</div>
      <FlexLayout>
        <Side>{side}</Side>
        <Main>{main}</Main>
      </FlexLayout>
    </div>
  );
}

export default DashboardLayout;
