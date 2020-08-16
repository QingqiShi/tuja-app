import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { RiEditLine, RiCheckLine, RiCloseLine } from 'react-icons/ri';
import Type from './Type';
import Button from './Button';
import TextInput from './TextInput';

const Container = styled.div`
  display: flex;
  align-items: center;
  > button {
    margin: -1rem 0 -1rem 0.5rem;
  }
`;

interface EditableTitleProps {
  value: string;
  onChange?: (newVal: string) => Promise<void>;
  scale?: React.ComponentProps<typeof Type>['scale'];
}

function EditableTitle({ value, onChange, scale = 'h3' }: EditableTitleProps) {
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  return (
    <Type scale={scale} noMargin>
      <Container>
        <span>
          {showInput ? (
            <TextInput
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          ) : (
            value
          )}
        </span>
        {showInput && onChange && (
          <>
            <Button
              variant="shout"
              icon={<RiCheckLine />}
              onClick={async () => {
                setLoading(true);
                await onChange(inputValue);
                setShowInput(false);
                setLoading(false);
              }}
              disabled={loading}
            />
            <Button
              icon={<RiCloseLine />}
              onClick={() => setShowInput(false)}
              disabled={loading}
            />
          </>
        )}
        {!showInput && onChange && (
          <Button icon={<RiEditLine />} onClick={() => setShowInput(true)} />
        )}
      </Container>
    </Type>
  );
}

export default EditableTitle;
