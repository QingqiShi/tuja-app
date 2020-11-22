import React, { useRef, useState } from 'react';
import { useIntersection, useClickAway } from 'react-use';
import { RiMenuLine } from 'react-icons/ri';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import Button from '../inputs/Button';
import { shadow, card, translucent } from '../../mixins';

const Placeholder = styled.div`
  height: 4rem;
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
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
  z-index: ${({ theme }) => theme.zIndex.fixed};
  background-color: ${({ theme }) =>
    transparentize(1, theme.colors.backgroundRaised)};
  transition: box-shadow 0.2s, background-color 0.2s;

  ${({ isAtTop }) =>
    !isAtTop &&
    css`
      ${shadow}
      ${translucent}
    `}

  height: 4rem;
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    height: 3.5rem;
  }

  padding: 0 ${({ theme }) => theme.spacings.xs};
  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    padding: 0 ${({ theme }) => theme.spacings.s};
  }
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    padding: 0 ${({ theme }) => theme.spacings.m};
  }
  @media (${({ theme }) => theme.breakpoints.minDesktop}) {
    padding: 0 ${({ theme }) => theme.spacings.l};
  }
`;

const LogoContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacings.s};
`;

const Nav = styled.nav`
  display: flex;
  flex-grow: 1;

  &:not(:first-child) {
    @media (${({ theme }) => theme.breakpoints.minLaptop}) {
      margin-left: ${({ theme }) => theme.spacings.m};
    }
  }

  > * {
    margin-right: ${({ theme }) => theme.spacings.xs};
  }

  > :last-child {
    margin-right: 0;
  }
`;

const EndNav = styled(Nav)`
  flex-grow: 0;
`;

const Overlay = styled.div`
  ${card}
  ${translucent}
  display: flex;
  flex-direction: column;
  position: fixed;
  padding: ${({ theme }) => theme.spacings.xs};
  z-index: ${({ theme }) => theme.zIndex.fixed};
  top: calc(4rem + ${({ theme }) => theme.spacings.xs});
  min-width: calc(100vw - ${({ theme }) => theme.spacings.xs} * 2);
  right: ${({ theme }) => theme.spacings.xs};

  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    min-width: 15rem;
    right: ${({ theme }) => theme.spacings.s};
  }
  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    top: calc(3.5rem + ${({ theme }) => theme.spacings.xs});
    right: ${({ theme }) => theme.spacings.m};
  }
  @media (${({ theme }) => theme.breakpoints.minDesktop}) {
    right: ${({ theme }) => theme.spacings.l};
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
  const intersection = useIntersection(placeholderRef, { threshold: 0.5 });

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
