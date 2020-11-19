import React, { useRef, useState } from 'react';
import { useIntersection, useClickAway } from 'react-use';
import { RiMenuLine } from 'react-icons/ri';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import Button from '../inputs/Button';
import { theme, getTheme } from '../../theme';
import { OverlayCard } from '../../commonComponents';

const Placeholder = styled.div`
  height: 4rem;
  @media (${theme.breakpoints.minLaptop}) {
    height: 3.5rem;
  }
`;

const Bar = styled.header<{ isAtTop: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  z-index: ${theme.zIndex.fixed};
  background-color: ${getTheme(theme.colors.backgroundRaised, (c) =>
    transparentize(1, c)
  )};
  transition: box-shadow 0.2s, background-color 0.2s, backdrop-filter 0.2s;

  ${({ isAtTop }) =>
    !isAtTop &&
    css`
      background-color: ${(props) =>
        isAtTop
          ? transparentize(0.1, theme.colors.backgroundMain(props))
          : transparentize(0.1, theme.colors.backgroundRaised(props))};
      box-shadow: ${theme.shadows.soft};
    `}

  @supports (backdrop-filter: blur(${theme.backdropBlur})) {
    backdrop-filter: blur(0);
    ${({ isAtTop }) =>
      !isAtTop &&
      css`
        backdrop-filter: blur(${theme.backdropBlur});
        background-color: ${(props) =>
          isAtTop
            ? transparentize(0.3, theme.colors.backgroundMain(props))
            : transparentize(0.3, theme.colors.backgroundRaised(props))};
      `}
  }

  height: 4rem;
  @media (${theme.breakpoints.minLaptop}) {
    height: 3.5rem;
  }

  padding: 0 ${theme.spacings('xs')};
  @media (${theme.breakpoints.minTablet}) {
    padding: 0 ${theme.spacings('s')};
  }
  @media (${theme.breakpoints.minLaptop}) {
    padding: 0 ${theme.spacings('m')};
  }
  @media (${theme.breakpoints.minDesktop}) {
    padding: 0 ${theme.spacings('l')};
  }
`;

const LogoContainer = styled.div`
  margin-right: ${theme.spacings('s')};
`;

const Nav = styled.nav`
  display: flex;
  flex-grow: 1;

  &:not(:first-child) {
    @media (${theme.breakpoints.minLaptop}) {
      margin-left: ${theme.spacings('m')};
    }
  }

  > * {
    margin-right: ${theme.spacings('xs')};
  }

  > :last-child {
    margin-right: 0;
  }
`;

const EndNav = styled(Nav)`
  flex-grow: 0;
`;

const Overlay = styled(OverlayCard)`
  display: flex;
  flex-direction: column;
  position: fixed;
  padding: ${theme.spacings('xs')};
  z-index: ${theme.zIndex.fixed};
  top: calc(4rem + ${theme.spacings('xs')});
  min-width: calc(100vw - ${theme.spacings('xs')} * 2);
  right: ${theme.spacings('xs')};

  @media (${theme.breakpoints.minTablet}) {
    min-width: 15rem;
    right: ${theme.spacings('s')};
  }
  @media (${theme.breakpoints.minLaptop}) {
    top: calc(3.5rem + ${theme.spacings('xs')});
    right: ${theme.spacings('m')};
  }
  @media (${theme.breakpoints.minDesktop}) {
    right: ${theme.spacings('l')};
  }
`;

interface TopBarProps {
  links?: React.ComponentProps<typeof Button>[];
  endLinks?: React.ComponentProps<typeof Button>[];
  menu?: React.ComponentProps<typeof Button>[];
  logo?: React.ReactNode;
}

function TopBar({ links, endLinks, menu, logo }: TopBarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(placeholderRef, { threshold: 1 });

  const flyoutRef = useRef<HTMLDivElement>(null);
  useClickAway(flyoutRef, () => setShowMenu(false));

  return (
    <Placeholder ref={placeholderRef}>
      <Bar isAtTop={!!intersection?.isIntersecting}>
        {logo && <LogoContainer>{logo}</LogoContainer>}
        <Nav>
          {links?.map((buttonProps, i) => (
            <Button
              key={`nav-${i}`}
              compact
              hideTextOnMobile
              {...buttonProps}
            />
          ))}
        </Nav>
        {!!endLinks?.length && (
          <EndNav>
            {endLinks.map((buttonProps, i) => (
              <Button
                key={`nav-${i}`}
                compact
                hideTextOnMobile
                {...buttonProps}
              />
            ))}
          </EndNav>
        )}
        {!!menu?.length && (
          <div>
            <Button
              icon={<RiMenuLine />}
              onClick={() => setShowMenu((val) => !val)}
              compact
            />
          </div>
        )}
      </Bar>
      {menu && showMenu && (
        <Overlay ref={flyoutRef}>
          {menu.map((menuItem, i) => (
            <Button
              key={`nav-menu-${i}`}
              align="start"
              compact
              {...menuItem}
              onClick={(e) => {
                setShowMenu(false);
                menuItem.onClick?.(e);
              }}
            />
          ))}
        </Overlay>
      )}
    </Placeholder>
  );
}

export default TopBar;
