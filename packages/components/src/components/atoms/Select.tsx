import styled, { css } from 'styled-components';
import { RiArrowDownSLine } from 'react-icons/ri';
import useKeyboardFocus from '../../hooks/useKeyboardFocus';
import { v } from '../../theme';

const Label = styled.label<{ noMargin?: boolean }>`
  display: block;
  text-align: left;
  width: 100%;
  position: relative;
  margin-bottom: ${v.spacerS};

  > * {
    width: 100%;
  }

  ${({ noMargin }) =>
    noMargin &&
    css`
      margin-bottom: 0;
    `};
`;

const LabelLine = styled.span`
  font-family: ${v.fontFamily};
  font-weight: ${v.fontRegular};
  margin: 0 ${v.spacerS};
  padding: ${v.spacerS} 0;
  color: ${v.textSecondary};
  font-size: 1rem;
  line-height: 1.2em;
  display: block;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border: 1px solid transparent;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transform-origin: 0 0;
  transition: transform 0.2s;
  z-index: 1;
  pointer-events: none;
  transform: scale(0.7);
  font-weight: ${v.fontSemiBold};
`;

const HelperText = styled.div`
  font-size: 0.6rem;
  font-weight: ${v.fontRegular};
  padding-left: ${v.spacerS};
  margin-top: ${v.spacerXS};
  color: ${v.textSecondary};
`;

const SelectContainer = styled.div<{ noMargin?: boolean }>`
  width: 100%;
  margin-bottom: ${v.spacerS};

  ${({ noMargin }) =>
    noMargin &&
    css`
      margin-bottom: 0;
    `};

  ${Label} & {
    margin-bottom: 0;
  }
`;

const SelectBase = styled.select<{ isKeyboardFocus?: boolean }>`
  color: ${v.textMain};
  background-color: ${v.backgroundHover};
  padding: ${v.spacerS} ${v.spacerS};
  box-shadow: ${v.shadowRaised};
  font-family: ${v.fontFamily};
  font-weight: ${v.fontRegular};
  font-size: 1rem;
  line-height: 1.2em;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  width: 100%;
  appearance: none;
  transition: border 0.2s, box-shadow 0.2s;
  padding-right: 3.5rem;

  &:focus {
    border-color: ${v.textSecondary};

    ${({ isKeyboardFocus }) =>
      !isKeyboardFocus &&
      css`
        outline: none;
      `}
  }

  &:disabled {
    opacity: 0.7;
    box-shadow: none;
    color: ${v.textSecondary};
  }

  &:hover:not(:focus):not(:disabled) {
    box-shadow: ${v.shadowOverlay};
    border-color: ${v.textSecondary};
  }

  ${Label} & {
    padding: calc(${v.spacerS} * 1.5) ${v.spacerS} calc(${v.spacerS} / 2);
  }

  option {
    font-size: 1rem;
    color: initial;
  }
`;

const IconContainer = styled.div`
  position: absolute;
  height: 100%;
  width: 3.5em;
  top: 0;
  right: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  padding: ${v.spacerS};
  color: ${v.textSecondary};
  z-index: 1;
`;

const IconWrapper = styled.div`
  position: relative;
`;

interface SelectProps extends Omit<React.ComponentProps<'select'>, 'ref'> {
  options: { label: string; value: string }[];
  label?: string;
  helperText?: string;
  noMargin?: boolean;
}

function Select({
  options,
  label,
  helperText,
  required,
  disabled,
  noMargin,
  ...props
}: SelectProps) {
  const [ref, isKeyboardFocus] = useKeyboardFocus();

  const select = (
    <SelectContainer noMargin={noMargin}>
      <IconWrapper>
        <SelectBase
          ref={ref}
          isKeyboardFocus={isKeyboardFocus}
          required={required}
          disabled={disabled}
          {...props}
        >
          {options.map((option) => (
            <option
              key={`option-${option.value}`}
              value={option.value}
              disabled={!option.value && required}
            >
              {option.label}
            </option>
          ))}
        </SelectBase>
        <IconContainer>
          <RiArrowDownSLine size="100%" />
        </IconContainer>
      </IconWrapper>
      {helperText && <HelperText>{helperText}</HelperText>}
    </SelectContainer>
  );

  if (label) {
    return (
      <Label noMargin={noMargin}>
        {label && (
          <LabelLine>
            {label}
            {required ? '*' : ''}
          </LabelLine>
        )}
        {select}
      </Label>
    );
  }

  return select;
}

export default Select;
