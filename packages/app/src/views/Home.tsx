import React from 'react';
import { Helmet } from 'react-helmet-async';
import { MdShowChart, MdPieChartOutlined, MdAutorenew } from 'react-icons/md';
import styled from 'styled-components/macro';
import Type from 'components/Type';
import Button from 'components/Button';
import { Center } from 'commonStyledComponents';
import { theme } from 'theme';

const FullHeight = styled.div`
  height: 60vh;
  padding: ${theme.spacings('m')};
`;

const Title = styled(Type)`
  margin-bottom: ${theme.spacings('s')};
  position: relative;
  display: inline-block;
`;

const SubTitle = styled(Type)`
  margin-top: ${theme.spacings('s')};
`;

const BetaBadge = styled.div`
  font-size: ${theme.fonts.ctaSize};
  font-weight: ${theme.fonts.ctaWeight};
  line-height: ${theme.fonts.ctaHeight};
  letter-spacing: ${theme.fonts.ctaSpacing};
  text-transform: uppercase;
  position: absolute;
  right: -${theme.spacings('xs')};
  top: 0;
  width: 0;
`;

function Home() {
  return (
    <div>
      <Helmet>
        <title>Tuja App | Portfolio Tracker</title>
      </Helmet>
      <FullHeight>
        <Center>
          <div>
            <Title scale="h1">
              Tuja<BetaBadge>Beta</BetaBadge>
            </Title>
            <SubTitle scale="h4">Portfolio Tracker</SubTitle>
            <Button variant="shout" to="/portfolio">
              Try now
            </Button>
          </div>
        </Center>
      </FullHeight>
      <FullHeight>
        <Center>
          <div>
            <Title scale="h2">
              <MdShowChart />
            </Title>
            <SubTitle scale="h3">Track your investments</SubTitle>
          </div>
        </Center>
      </FullHeight>
      <FullHeight>
        <Center>
          <Title scale="h2">
            <MdPieChartOutlined />
          </Title>
          <SubTitle scale="h3">Analyse your portfolio performance</SubTitle>
        </Center>
      </FullHeight>
      <FullHeight>
        <Center>
          <Title scale="h2">
            <MdAutorenew />
          </Title>
          <SubTitle scale="h3">Automate investing using allocations</SubTitle>
        </Center>
      </FullHeight>
      <FullHeight>
        <Center>
          <Title scale="h1">Try Tuja now</Title>
          <Button variant="shout" to="/portfolio">
            Go to app
          </Button>
        </Center>
      </FullHeight>
    </div>
  );
}

export default Home;
