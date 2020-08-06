import React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components/macro';
import InvestmentsTable from 'components/InvestmentsTable';
import AutoInvest from 'components/AutoInvest';
import Type from 'components/Type';
import PortfolioOverview from 'components/PortfolioOverview';
import PortfolioListLayout from 'components/PortfolioListLayout';
import { Card, TitleRow } from 'commonStyledComponents';
import usePortfolio from 'hooks/usePortfolio';
import usePortfolioPerformance from 'hooks/usePortfolioPerformance';
import { theme } from 'theme';

const Container = styled.div`
  margin-bottom: env(safe-area-inset-bottom);
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

const NoInvestmentBanner = styled.div`
  display: grid;
  place-items: center;
  margin: ${theme.spacings('m')};
`;

function PortfolioList() {
  const { portfolio } = usePortfolio();
  const { portfolioPerformance } = usePortfolioPerformance();

  if (!portfolio || !portfolioPerformance) {
    return (
      <>
        <Helmet>
          <title>Portfolio | Tuja App</title>
        </Helmet>
        <NoInvestmentBanner>
          <Card>No investments found in your portfolio</Card>
        </NoInvestmentBanner>
      </>
    );
  }

  return (
    <Container>
      <Helmet>
        <title>Portfolio | Tuja App</title>
      </Helmet>
      <TitleRow>
        <Type scale="h3">Portfolio</Type>
      </TitleRow>
      <PortfolioListLayout
        overview={<PortfolioOverview editable />}
        holdings={
          <InvestmentsTable
            currency={portfolio.currency}
            portfolioPerformance={portfolioPerformance}
          />
        }
        autoInvest={<AutoInvest portfolioPerformance={portfolioPerformance} />}
      />
    </Container>
  );
}

export default PortfolioList;
