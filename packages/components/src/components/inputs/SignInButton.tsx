import styled, { css } from 'styled-components';
import { getContrast } from 'polished';
import { shadow, ctaFont } from '../../mixins';

const getContrastColor = (bg: string, colors: string[]) => {
  let maxContrast: number = 0;
  let contrastColor: string = '';
  colors.forEach((color) => {
    const contrast = getContrast(bg, color);
    console.log(contrast, color);
    if (contrast > maxContrast) {
      maxContrast = contrast;
      contrastColor = color;
    }
  });
  return contrastColor;
};

const ButtonBase = styled.button<{ bgColor?: string }>`
  ${shadow}
  ${ctaFont}
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ bgColor, theme }) =>
    bgColor ?? theme.colors.backgroundRaised};
  color: ${({ bgColor, theme }) =>
    getContrastColor(bgColor ?? theme.colors.backgroundRaised, [
      theme.colors.textOnBackground,
      theme.colors.backgroundRaised,
    ])};
  border-radius: ${({ theme }) => theme.spacings.xs};
  padding: 0 ${({ theme }) => theme.spacings.l} 0 0;
  border: none;
  min-width: 15rem;
  overflow: hidden;
  cursor: pointer;

  height: 3.9rem;
  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    height: 3.5rem;
  }
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    height: 2.8rem;
  }
`;

const IconContainer = styled.span<{ bgColor?: string; color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 3.9rem;
  width: 3.9rem;
  padding: 0.65rem;
  margin-right: ${({ theme }) => theme.spacings.s};

  ${({ bgColor }) =>
    bgColor &&
    css`
      border-radius: ${({ theme }) => theme.spacings.xs} 0 0
        ${({ theme }) => theme.spacings.xs};
      background-color: ${bgColor};
    `}
  ${({ bgColor, color }) =>
    bgColor &&
    color &&
    css`
      border: 1px solid ${color};
    `}

  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    height: 3.5rem;
    width: 3.5rem;
  }
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    height: 2.8rem;
    width: 2.8rem;
  }
`;

const LongText = styled.span`
  display: none;
  @media (min-width: 23rem) {
    display: block;
  }
`;

const ShortText = styled.span`
  display: block;
  @media (min-width: 23rem) {
    display: none;
  }
`;

interface SignInButtonProps {
  icon: React.ReactNode;
  shortText?: string;
  bgColor?: string;
  iconBgColor?: string;
  onClick?: React.MouseEventHandler;
}

function SignInButton({
  children,
  shortText,
  icon,
  bgColor,
  iconBgColor,
  onClick,
}: React.PropsWithChildren<SignInButtonProps>) {
  return (
    <ButtonBase onClick={onClick} bgColor={bgColor} type="button">
      <IconContainer bgColor={iconBgColor} color={bgColor}>
        {icon}
      </IconContainer>
      <LongText>{children}</LongText>
      <ShortText>{shortText || children}</ShortText>
    </ButtonBase>
  );
}

export default SignInButton;
