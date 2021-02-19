import styled, { css } from 'styled-components';
import { RiInformationFill, RiErrorWarningFill } from 'react-icons/ri';
import { transparentize } from 'polished';
import { helperFont } from '../../mixins';

type BannerVariant = undefined | 'error';

const BannerContainer = styled.div<{ variant: BannerVariant }>`
  ${helperFont}
  border-radius: ${({ theme }) => theme.spacings.xs};
  padding: ${({ theme }) => theme.spacings.s};
  display: flex;

  > :first-child {
    margin-right: ${({ theme }) => theme.spacings.s};
    min-width: 1.5rem;
  }

  > :last-child {
    line-height: 1.5rem;
  }

  ${({ variant }) => {
    switch (variant) {
      case 'error':
        return css`
          color: ${({ theme }) => theme.colors.backgroundMain};
          background-color: ${({ theme }) => theme.colors.error};
        `;
      default:
        return css`
          color: ${({ theme }) => theme.colors.textOnBackground};
          background-color: ${({ theme }) =>
            transparentize(0.9, theme.colors.textOnBackground)};
        `;
    }
  }}
`;

const icons = {
  error: RiErrorWarningFill,
};

interface BannerProps {
  variant?: BannerVariant;
}

function Banner({ children, variant }: React.PropsWithChildren<BannerProps>) {
  const Icon = variant ? icons[variant] : RiInformationFill;
  return (
    <BannerContainer variant={variant}>
      <Icon size="1.5rem" />
      <span>{children}</span>
    </BannerContainer>
  );
}

export default Banner;
