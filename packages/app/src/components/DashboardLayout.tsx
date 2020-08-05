import React from 'react';
import styled from 'styled-components/macro';
import Type from 'components/Type';
import { Card, CardMedia } from 'commonStyledComponents';
import { theme } from 'theme';

const LayoutGrid = styled.div`
  width: 100%;
  text-align: left;
  display: grid;
  grid-template-rows: auto 500px 200px 200px;
  grid-template-areas:
    'overview'
    'values'
    'gains'
    'returns';
  grid-gap: ${theme.spacings('s')};

  @media (${theme.breakpoints.minTablet}) {
    grid-template-columns: 250px 1fr;
    grid-template-rows: 1fr 1fr 500px;
    grid-template-areas:
      'overview gains'
      'overview returns'
      'values values';
  }

  @media (${theme.breakpoints.minLaptop}) {
    grid-template-columns: 350px 1fr 1fr 350px;
    grid-template-rows: auto 250px;
    grid-template-areas:
      'overview values values values'
      'gains gains returns returns';
  }

  @media (${theme.breakpoints.minDesktop}) {
    grid-template-columns: 500px 1fr;
    grid-template-rows: 1fr 200px 200px;
    grid-template-areas:
      'overview values'
      'gains values'
      'returns values';
  }
`;

const Overview = styled(Card)`
  grid-area: overview;
`;

const Gains = styled(Card)`
  grid-area: gains;
  h6 {
    margin-top: 0;
    margin-bottom: 0.5em;
  }
`;

const Returns = styled(Card)`
  grid-area: returns;
  h6 {
    margin-top: 0;
    margin-bottom: 0.5em;
  }
`;

const Values = styled(Card)`
  grid-area: values;
  position: relative;
`;

const GraphRange = styled.div`
  margin: ${theme.spacings('s')} 0;

  @media (${theme.breakpoints.minTablet}) {
    display: block;
    position: absolute;
    margin: 0;
    font-size: 1.25rem;
    height: 1.1em;
    display: flex;
    align-items: center;
    right: ${theme.spacings('s')};
    top: ${theme.spacings('m')};

    > div {
      font-size: 1rem;
    }
  }

  @media (${theme.breakpoints.minLaptop}) {
    right: ${theme.spacings('m')};
    top: ${theme.spacings('m')};
  }
`;

interface DashboardLayoutProps {
  overview: React.ReactNode;
  values: React.ReactNode;
  gains: React.ReactNode;
  returns: React.ReactNode;
  datePeriod: React.ReactNode;
}

function DashboardLayout({
  overview,
  values,
  gains,
  returns,
  datePeriod,
}: DashboardLayoutProps) {
  return (
    <LayoutGrid>
      <Overview>{overview}</Overview>
      <Values>
        <Type scale="h6">Portfolio Value</Type>
        <GraphRange>{datePeriod}</GraphRange>
        <CardMedia>{values}</CardMedia>
      </Values>
      <Gains>
        <Type scale="h6">Gains</Type>
        <CardMedia>{gains}</CardMedia>
      </Gains>
      <Returns>
        <Type scale="h6">Returns</Type>
        <CardMedia>{returns}</CardMedia>
      </Returns>
    </LayoutGrid>
  );
}

export default DashboardLayout;
