import { motion } from 'framer-motion';
import { useState } from 'react';
import { useMedia } from 'react-use';
import styled, { css } from 'styled-components';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import { v } from '../../theme';
import ButtonPrimary from '../atoms/ButtonPrimary';

const Container = styled.div`
  display: flex;
  flex-direction: column-reverse;

  @media (${v.minLaptop}) {
    display: grid;
    grid-template-columns: 40% 60%;
    grid-template-areas: 'secondary primary';
    align-items: flex-start;
  }
  @media (${v.minDesktop}) {
    grid-template-columns: 500px 1fr;
  }
`;

const Primary = styled.main`
  min-width: 0;
  padding-left: calc(env(safe-area-inset-left) + ${v.leftRightPadding});
  padding-right: calc(env(safe-area-inset-right) + ${v.leftRightPadding});
  @media (${v.minLaptop}) {
    height: 100%;
    grid-area: primary;
    padding-left: calc(${v.leftRightPadding} / 2);
    padding-right: ${v.leftRightPadding};
  }
`;

const SecondaryContainer = styled.details<{ offset?: string }>`
  position: sticky;
  top: ${({ offset }) => offset ?? '0'};
  z-index: ${v.zModal};

  @media (${v.minLaptop}) {
    overflow-y: auto;
    grid-area: secondary;
    z-index: ${v.zBackground};

    > div {
      height: 100%;
    }
  }
`;

const SecondarySummary = styled.summary`
  box-sizing: border-box;
  display: flex;
  box-shadow: ${v.shadowRaised};
  background-color: ${v.backgroundRaised};
  list-style-type: none;
  outline: none;
  padding: ${v.spacerXS} 0;
  padding-left: calc(env(safe-area-inset-left) + ${v.leftRightPadding});
  padding-right: calc(env(safe-area-inset-right) + ${v.leftRightPadding});

  &::-webkit-details-marker {
    display: none;
  }

  @media (${v.minLaptop}) {
    display: none;
  }
`;

const Secondary = styled.div<{ offset?: string }>`
  box-sizing: border-box;
  display: block;
  position: fixed;
  z-index: ${v.zFixed};
  max-height: ${({ offset }) =>
    offset ? css`calc(100vh - ${offset})` : css`100vh`};
  top: ${({ offset }) => offset ?? '0'};
  bottom: 0;
  left: 0;
  right: 0;

  @media (${v.minLaptop}) {
    position: static;
  }
`;

const SecondaryCard = motion(styled.aside`
  box-shadow: ${v.shadowOverlay};
  border-radius: ${v.radiusCard};
  background-color: ${v.backgroundRaised};
  max-height: 100%;
  overflow: hidden;
  position: fixed;
  top: 8vh;
  left: calc(env(safe-area-inset-left) + ${v.leftRightPadding});
  right: calc(env(safe-area-inset-right) + ${v.leftRightPadding});
  bottom: -8vh;
  z-index: ${v.zModal};

  @media (${v.minTablet}) {
    left: calc(env(safe-area-inset-left) + 10vw);
    right: calc(env(safe-area-inset-right) + 10vw);
  }

  @media (${v.minLaptop}) {
    position: static;
    border-radius: 0;
    box-shadow: none;
    background-color: transparent;
  }
`);

const SecondaryScrollBox = styled.div`
  max-height: 100%;
  overflow-y: auto;
  padding-bottom: calc(8vh + 6rem + ${v.spacerM});
  @media (${v.minLaptop}) {
    padding-bottom: ${v.spacerM};
  }
`;

const SecondaryBackdrop = motion(styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${v.backgroundTranslucent};
  z-index: ${v.zBackdrop};

  @media (${v.minLaptop}) {
    display: none;
  }
`);

const commonStickyContainerStyles = css`
  position: sticky;
  bottom: 0;
  padding: ${v.spacerS} ${v.spacerS}
    calc(${v.spacerS} + env(safe-area-inset-bottom));
  display: flex;
  justify-content: stretch;
  background-color: ${v.backgroundTranslucent};
  backdrop-filter: blur(${v.spacerM});

  > * {
    flex-grow: 1;
    justify-content: center;
    &:not(:last-child) {
      margin-right: ${v.spacerXS};
    }
  }
`;

const MobileStickyContainer = styled.div`
  ${commonStickyContainerStyles}
  position: absolute;
  left: 0;
  right: 0;
  padding-bottom: calc(${v.spacerS} + env(safe-area-inset-bottom) + 8vh);
  z-index: ${v.zFixed};

  @media (${v.minLaptop}) {
    display: none;
  }
`;

const LaptopStickyContainer = styled.div`
  display: none;

  @media (${v.minLaptop}) {
    ${commonStickyContainerStyles}
  }
`;

interface ResponsiveSplitProps {
  primary: React.ReactNode;
  secondary:
    | React.ReactNode
    | ((props: { closeSecondary: () => void }) => React.ReactNode);
  secondarySummary?:
    | React.ReactNode
    | ((props: { openSecondary: () => void }) => React.ReactNode);
  secondarySticky?: React.ReactNode;
  stickyOffset?: string;
}

function ResponsiveSplit({
  primary,
  secondary,
  secondarySummary,
  secondarySticky,
  stickyOffset,
}: ResponsiveSplitProps) {
  const isLaptop = useMedia(`(${v.minLaptop})`);

  const [isSecondaryOpen, setIsSecondaryOpen] = useState(isLaptop);
  const [isShowVariant, setIsShowVariant] = useState(false);

  const scrollLockTarget = useBodyScrollLock<HTMLDivElement>(
    !isLaptop && isSecondaryOpen
  );

  const openSecondary = () => {
    setIsSecondaryOpen(true);
    setIsShowVariant(true);
  };

  const closeSecondary = () => {
    setIsShowVariant(false);
  };

  return (
    <Container>
      <Primary>{primary}</Primary>
      <SecondaryContainer
        data-testid="responsive-split-secondary-container"
        open={isLaptop || isSecondaryOpen}
        offset={stickyOffset}
      >
        <SecondarySummary onClick={(e) => e.preventDefault()} tabIndex={-1}>
          {(typeof secondarySummary === 'function'
            ? secondarySummary({ openSecondary })
            : secondarySummary) ?? (
            <ButtonPrimary onClick={openSecondary}>View</ButtonPrimary>
          )}
        </SecondarySummary>
        <Secondary offset={stickyOffset}>
          <SecondaryBackdrop
            onClick={closeSecondary}
            variants={{ show: { opacity: 1 }, hide: { opacity: 0 } }}
            initial="hide"
            animate={isLaptop || isShowVariant ? 'show' : 'hide'}
            data-testid="responsive-split-backdrop"
          />
          <SecondaryCard
            variants={{
              show: { transform: 'translate3d(0, 0vh, 0)' },
              hide: {
                transform: isLaptop
                  ? 'translate3d(0, 0vh, 0)'
                  : 'translate3d(0, 100vh, 0)',
              },
            }}
            initial="hide"
            animate={isLaptop || isShowVariant ? 'show' : 'hide'}
            onAnimationComplete={(variant) =>
              variant === 'hide' && setIsSecondaryOpen(false)
            }
            data-testid="responsive-split-secondary-card"
          >
            <SecondaryScrollBox ref={scrollLockTarget}>
              {typeof secondary === 'function'
                ? secondary({ closeSecondary })
                : secondary}
              {secondarySticky && (
                <MobileStickyContainer>{secondarySticky}</MobileStickyContainer>
              )}
            </SecondaryScrollBox>
          </SecondaryCard>
          {secondarySticky && (
            <LaptopStickyContainer>{secondarySticky}</LaptopStickyContainer>
          )}
        </Secondary>
      </SecondaryContainer>
    </Container>
  );
}

export default ResponsiveSplit;
