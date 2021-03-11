import { useState, useRef, useEffect } from 'react';
import { useClickAway } from 'react-use';
import styled, { css } from 'styled-components';
import { CaretDown } from 'phosphor-react';
import ButtonBase from './ButtonBase';
import ButtonSecondary from './ButtonSecondary';
import { v } from '../../theme';

type MenuAlign = 'left' | 'right';

const Container = styled.div<{ align?: MenuAlign }>`
  position: relative;
  ${({ align }) => align === 'right' && 'text-align: right;'}
`;

const ButtonLabel = styled.span`
  margin-right: ${v.spacerXS};
`;

const Menu = styled.div<{ align?: MenuAlign }>`
  position: absolute;
  top: 0;
  border-radius: ${v.radiusCard};
  background-color: ${v.backgroundOverlay};
  box-shadow: ${v.shadowOverlay};
  padding: ${v.spacerXS};
  z-index: ${v.zFixed};

  ${({ align }) => (align === 'right' ? 'right: 0;' : 'left: 0;')}
`;

const MenuItem = styled(ButtonBase)`
  display: block;
  width: 100%;
  text-align: left;
  border-radius: ${v.radiusMedia};
  padding: ${v.spacerS} ${v.spacerM};

  &:hover {
    background-color: ${v.backgroundHover};
  }
`;

interface DropdownMenuProps {
  value: string;
  options: { value: string; label: string }[];
  align?: MenuAlign;
  onChange?: (value: string) => void;
}

function DropdownMenu({ align, value, options, onChange }: DropdownMenuProps) {
  const [showOverlay, setShowOverlay] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  useClickAway(menuRef, () => setShowOverlay(false), [
    'mousedown',
    'touchstart',
    'focusin',
  ]);

  return (
    <Container align={align}>
      <ButtonSecondary onClick={() => setShowOverlay(true)}>
        <ButtonLabel>
          {options.find((o) => o.value === value)?.label}
        </ButtonLabel>
        <CaretDown weight="bold" />
      </ButtonSecondary>
      {showOverlay && (
        <Menu ref={menuRef} align={align}>
          {options.map((option, i) => (
            <MenuItem
              key={`menu-option-${i}`}
              autoFocus={i === 0}
              onClick={() => {
                onChange?.(option.value);
                setShowOverlay(false);
              }}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </Container>
  );
}

export default DropdownMenu;
