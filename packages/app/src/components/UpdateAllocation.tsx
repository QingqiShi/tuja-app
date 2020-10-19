import React, { useState, useEffect } from 'react';
import { RiCheckLine } from 'react-icons/ri';
import styled from 'styled-components/macro';
import { Button } from '@tuja/components';
import TextInput from './TextInput';
import { updateHoldingAllocation } from 'libs/portfolio';
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

interface UpdateAllocationProps {
  ticker: string;
  onClose?: () => void;
}

function UpdateAllocation({ ticker, onClose }: UpdateAllocationProps) {
  const { portfolio } = usePortfolio();
  const currentAllocation = portfolio?.targetAllocations?.[ticker] ?? 0;
  const [rawAllocation, setRawAllocation] = useState(
    `${currentAllocation * 100}%`
  );
  const [allocation, setAllocation] = useState(currentAllocation);

  useEffect(() => {
    setAllocation(currentAllocation);
  }, [currentAllocation, ticker]);

  return (
    <Container>
      <TextInput
        label={`Target allocation for ${ticker}`}
        value={rawAllocation}
        onChange={(e) => setRawAllocation(e.target.value)}
        onBlur={() => {
          const val = parseFloat(rawAllocation);
          if (!isNaN(val)) {
            setAllocation(val / 100);
            setRawAllocation(`${val}%`);
          } else {
            setRawAllocation(`${allocation * 100}%`);
          }
        }}
        inputMode="decimal"
      />
      <ActionsContainer>
        <Button
          startIcon={<RiCheckLine />}
          variant="shout"
          onClick={() => {
            if (portfolio?.id) {
              updateHoldingAllocation(portfolio.id, ticker, allocation);
            }
            if (onClose) {
              onClose();
            }
          }}
        >
          Set Allocation
        </Button>
        <Button
          onClick={() => {
            setAllocation(currentAllocation);
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

export default UpdateAllocation;
