import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { RiEditLine, RiCheckLine, RiCloseLine } from 'react-icons/ri';
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
  onChange?: (newVal: string) => Promise<void>;
  defaultValue?: string;
}

function EditableTitle({
  children,
  defaultValue,
  onChange,
}: React.PropsWithChildren<EditableTitleProps>) {
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue || '');

  return (
    <div>
      <Container>
        <span>
          {showInput ? (
            <TextInput
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          ) : (
            children
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
    </div>
  );
}

export default EditableTitle;
