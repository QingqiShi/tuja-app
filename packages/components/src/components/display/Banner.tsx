import styled, { css } from 'styled-components';
import { RiInformationFill, RiErrorWarningFill } from 'react-icons/ri';
import { transparentize } from 'polished';
import Button from '../inputs/Button';
import { helperFont } from '../../mixins';

type BannerVariant = undefined | 'error';

const StyledButton = styled(Button)``;

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
          color: ${({ theme }) => theme.colors.textOnError};
          background-color: ${({ theme }) => theme.colors.error};

          & ${StyledButton} {
            color: ${({ theme }) => theme.colors.textOnError};
            background-color: ${({ theme }) =>
              transparentize(0.9, theme.colors.textOnError)};
            border: 1px solid
              ${({ theme }) => transparentize(0.8, theme.colors.textOnError)};

            &:hover {
              background-color: ${({ theme }) =>
                transparentize(0.75, theme.colors.textOnError)};
              border: 1px solid
                ${({ theme }) => transparentize(0.6, theme.colors.textOnError)};
            }

            &:focus {
              box-shadow: 0 0 0.2rem 0
                ${({ theme }) => transparentize(0.15, theme.colors.textOnError)};
            }
          }
        `;
      default:
        return css`
          color: ${({ theme }) => theme.colors.textOnBackground};
          background-color: ${({ theme }) =>
            transparentize(0.9, theme.colors.textOnBackground)};

          & ${StyledButton} {
            color: ${({ theme }) => theme.colors.textOnBackground};
          }
        `;
    }
  }}

  & ${StyledButton} {
    font-size: 0.8rem;
    margin-top: ${({ theme }) => theme.spacings.xs};
  }
`;

const icons = {
  error: RiErrorWarningFill,
};

interface BannerProps {
  variant?: BannerVariant;
  action?: { label: string; onClick: () => void };
}

function Banner({
  children,
  variant,
  action,
}: React.PropsWithChildren<BannerProps>) {
  const Icon = variant ? icons[variant] : RiInformationFill;
  return (
    <BannerContainer variant={variant}>
      <Icon size="1.5rem" />
      <div>
        <div>{children}</div>
        {action && (
          <StyledButton onClick={action.onClick} variant="outline" compact>
            {action.label}
          </StyledButton>
        )}
      </div>
    </BannerContainer>
  );
}

export default Banner;
