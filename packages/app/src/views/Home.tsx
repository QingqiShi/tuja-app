import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MdShowChart, MdPieChartOutlined, MdAutorenew } from 'react-icons/md';
import styled from 'styled-components/macro';
import { Button, Type, v } from '@tuja/components';
import { Center } from 'commonStyledComponents';
import useScrollToTopOnMount from 'hooks/useScrollToTopOnMount';

const FullHeight = styled.div`
  height: 60vh;
  padding: ${v.spacerM};
`;

const Title = styled(Type)`
  margin-bottom: ${v.spacerS};
  position: relative;
  display: inline-block;
`;

const SubTitle = styled(Type)`
  margin-top: ${v.spacerS};
`;

const BetaBadge = styled.div`
  font-size: 1rem;
  font-weight: ${v.fontSemiBold};
  text-transform: uppercase;
  position: absolute;
  right: -${v.spacerXS};
  top: 0;
  width: 0;
`;

function Home() {
  useScrollToTopOnMount();
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
            <Button variant="shout" as={Link} otherProps={{ to: '/portfolio' }}>
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
          <Button variant="shout" as={Link} otherProps={{ to: '/portfolio' }}>
            Go to app
          </Button>
        </Center>
      </FullHeight>
    </div>
  );
}

export default Home;
