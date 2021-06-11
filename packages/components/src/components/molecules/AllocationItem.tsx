import styled from 'styled-components';
import { Percent, XCircle } from 'phosphor-react';
import ButtonIcon from '../atoms/ButtonIcon';
import NumberInput from '../atoms/NumberInput';
import SliderBase from '../atoms/Slider';
import StockListItem from './StockListItem';
import { v } from '../../theme';

const Row = styled.div`
  display: flex;
  align-items: center;
  width: 100%;

  > :first-child {
    flex-grow: 1;
  }
`;

const InputContainer = styled.div`
  width: 5rem;
  margin-left: ${v.spacerXS};
`;

const IconContainer = styled.div`
  align-self: flex-start;
  margin-left: ${v.spacerXS};
  width: 5rem;
  display: flex;
  justify-content: flex-end;
`;

const Slider = styled(SliderBase)`
  width: auto;
`;

interface AllocationItemProps {
  stockInfo: {
    name: string;
    code: string;
    exchange?: string;
  };
  allocation?: number;
  onChange?: (allocation: number) => void;
  onRemove?: () => void;
}

function AllocationItem({
  stockInfo,
  allocation,
  onChange,
  onRemove,
}: AllocationItemProps) {
  return (
    <div>
      <Row>
        <StockListItem {...stockInfo} />
        <IconContainer>
          <ButtonIcon data-testid="allocation-remove-btn" onClick={onRemove}>
            <XCircle />
          </ButtonIcon>
        </IconContainer>
      </Row>
      <Row>
        <Slider value={allocation} onChange={onChange} />
        <InputContainer>
          <NumberInput
            data-testid="allocation-input"
            value={Math.round((allocation ?? 0) * 10) / 10}
            onChange={onChange}
            endIcon={<Percent />}
            max={100}
            min={0}
            noMargin
            compact
          />
        </InputContainer>
      </Row>
    </div>
  );
}

export default AllocationItem;
