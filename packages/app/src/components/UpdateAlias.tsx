import { useState, useEffect } from 'react';
import { RiCheckLine } from 'react-icons/ri';
import styled from 'styled-components/macro';
import { Button, TextInput } from '@tuja/components';
import { updateHoldingAlias } from 'libs/portfolioClient';
import usePortfolio from 'hooks/usePortfolio';
import { theme } from 'theme';

const Container = styled.div`
  width: 400px;
  max-width: 100%;
  margin: ${theme.spacings('m')} auto 0;
  text-align: center;
  position: relative;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  justify-content: space-between;
  position: sticky;
  background-color: ${theme.colors.backgroundRaised};
  bottom: -${theme.spacings('s')};
  padding: ${theme.spacings('s')};
  margin: 0 -${theme.spacings('s')};
  @media (${theme.breakpoints.minTablet}) {
    bottom: -${theme.spacings('m')};
    margin: 0 -${theme.spacings('s')};
  }
  @media (${theme.breakpoints.minLaptop}) {
    bottom: -${theme.spacings('m')};
    margin: 0 -${theme.spacings('m')};
  }
`;

interface UpdateAliasProps {
  ticker: string;
  onClose?: () => void;
}

function UpdateAlias({ ticker, onClose }: UpdateAliasProps) {
  const { portfolio } = usePortfolio();
  const currentAlias = portfolio?.aliases[ticker] ?? '';
  const [alias, setAlias] = useState(currentAlias);

  useEffect(() => {
    setAlias(currentAlias);
  }, [currentAlias, ticker]);

  return (
    <Container>
      <TextInput
        label={`Alias for ${ticker}`}
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
      />
      <ActionsContainer>
        <Button
          startIcon={<RiCheckLine />}
          variant="shout"
          onClick={() => {
            if (portfolio?.id) {
              updateHoldingAlias(portfolio.id, ticker, alias);
            }
            if (onClose) {
              onClose();
            }
          }}
        >
          Set Alias
        </Button>
        <Button
          onClick={() => {
            setAlias(currentAlias);
            if (onClose) {
              onClose();
            }
          }}
        >
          Cancel
        </Button>
      </ActionsContainer>
    </Container>
  );
}

export default UpdateAlias;
