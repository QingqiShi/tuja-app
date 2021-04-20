import { useState, useEffect } from 'react';
import { RiCheckLine } from 'react-icons/ri';
import styled from 'styled-components';
import { ButtonPrimary, ButtonTertiary, TextInput, v } from '@tuja/components';
import { updateHoldingAlias } from '../libs/portfolioClient';
import usePortfolio from '../hooks/usePortfolio';

const Container = styled.div`
  width: 400px;
  max-width: 100%;
  margin: ${v.spacerM} auto 0;
  text-align: center;
  position: relative;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  justify-content: space-between;
  position: sticky;
  background-color: ${v.backgroundRaised};
  bottom: -${v.spacerS};
  padding: ${v.spacerS};
  margin: 0 -${v.spacerS};
  @media (${v.minTablet}) {
    bottom: -${v.spacerM};
    margin: 0 -${v.spacerS};
  }
  @media (${v.minLaptop}) {
    bottom: -${v.spacerM};
    margin: 0 -${v.spacerM};
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
        <ButtonPrimary
          onClick={() => {
            if (portfolio?.id) {
              updateHoldingAlias(portfolio.id, ticker, alias);
            }
            if (onClose) {
              onClose();
            }
          }}
        >
          <RiCheckLine />
          <span>Set Alias</span>
        </ButtonPrimary>
        <ButtonTertiary
          onClick={() => {
            setAlias(currentAlias);
            if (onClose) {
              onClose();
            }
          }}
        >
          Cancel
        </ButtonTertiary>
      </ActionsContainer>
    </Container>
  );
}

export default UpdateAlias;
