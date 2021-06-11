import { motion } from 'framer-motion';
import { useState } from 'react';
import { useMedia } from 'react-use';
import styled, { css } from 'styled-components';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import { v } from '../../theme';
import ButtonPrimary from '../atoms/ButtonPrimary';
import EdgePadding from './EdgePadding';

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
  @media (${v.minLaptop}) {
    height: 100%;
    grid-area: primary;
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
  display: block;
  padding: ${v.spacerXS} 0;
  box-shadow: ${v.shadowRaised};
  background-color: ${v.backgroundRaised};
  list-style-type: none;
  outline: none;

  &::marker {
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
  background-color: ${v.backgroundOverlay};
  max-height: 100%;
  overflow: hidden;
  position: fixed;
  top: 8vh;
  left: ${v.spacerXS};
  right: ${v.spacerXS};
  bottom: -8vh;
  z-index: ${v.zModal};

  @media (${v.minTablet}) {
    left: 10vw;
    right: 10vw;
  }

  @media (${v.minLaptop}) {
    position: static;
    border-radius: 0;
    box-shadow: 0;
    background-color: transparent;
  }
`);

const SecondaryScrollBox = styled.div`
  max-height: 100%;
  overflow-y: auto;
  padding-bottom: calc(8vh + ${v.spacerM});
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

interface ResponsiveSplitProps {
  primary: React.ReactNode;
  secondary:
    | React.ReactNode
    | ((props: { closeSecondary: () => void }) => React.ReactNode);
  secondarySummary?:
    | React.ReactNode
    | ((props: { openSecondary: () => void }) => React.ReactNode);
  stickyOffset?: string;
}

function ResponsiveSplit({
  primary,
  secondary,
  secondarySummary,
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
            <EdgePadding>
              <ButtonPrimary onClick={openSecondary}>View</ButtonPrimary>
            </EdgePadding>
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
            </SecondaryScrollBox>
          </SecondaryCard>
        </Secondary>
      </SecondaryContainer>
    </Container>
  );
}

export default ResponsiveSplit;
