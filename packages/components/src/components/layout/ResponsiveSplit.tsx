import { useMedia } from 'react-use';
import styled from 'styled-components';
import { v } from '../../theme';

const Container = styled.div`
  @media (${v.minLaptop}) {
    display: grid;
    grid-template-columns: 40% 60%;
  }
  @media (${v.minDesktop}) {
    max-width: 80rem;
    margin: 0 auto;
    padding-left: 6rem;
  }
`;

const Primary = styled.div`
  @media (${v.minLaptop}) {
    max-height: 100vh;
    max-height: --webkit-fill-available;
    overflow-y: auto;
  }
`;

const Secondary = styled.div`
  @media (${v.minLaptop}) {
    max-height: 100vh;
    max-height: --webkit-fill-available;
    overflow-y: auto;
  }
`;

interface ResponsiveSplitProps {
  primary: React.ReactNode;
  secondary: React.ReactNode;
  focusOn?: 'primary' | 'secondary';
}

function ResponsiveSplit({
  primary,
  secondary,
  focusOn,
}: ResponsiveSplitProps) {
  const isLaptop = useMedia(`(${v.minLaptop})`);
  return (
    <Container>
      {(focusOn !== 'secondary' || isLaptop) && <Primary>{primary}</Primary>}
      {(focusOn === 'secondary' || isLaptop) && (
        <Secondary>{secondary}</Secondary>
      )}
    </Container>
  );
}

export default ResponsiveSplit;
