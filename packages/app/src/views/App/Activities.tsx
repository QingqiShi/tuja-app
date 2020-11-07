import React from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components/macro';
import { Type } from '@tuja/components';
import ActivitiesList from 'components/ActivitiesList';
import { Card, TitleRow } from 'commonStyledComponents';
import usePortfolio from 'hooks/usePortfolio';
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

const NoActivityBanner = styled.div`
  display: grid;
  place-items: center;
  margin: ${theme.spacings('m')};
`;

function Activities() {
  const { portfolio } = usePortfolio();

  if (!portfolio?.activities.length) {
    return (
      <>
        <Helmet>
          <title>Activities | Tuja App</title>
        </Helmet>
        <NoActivityBanner>
          <Card>No activity found</Card>
        </NoActivityBanner>
      </>
    );
  }

  return (
    <Container>
      <Helmet>
        <title>Activities | Tuja App</title>
      </Helmet>
      <TitleRow>
        <Type scale="h3">Activities</Type>
      </TitleRow>
      <ActivitiesList />
    </Container>
  );
}

export default Activities;
