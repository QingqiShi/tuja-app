import { useRef, useState } from 'react';
import { useIntersection, useClickAway } from 'react-use';
import { RiMenuLine } from 'react-icons/ri';
import styled, { css } from 'styled-components';
import Button from '../inputs/Button';
import EdgePadding from '../layout/EdgePadding';
import { shadow, card, translucent } from '../../mixins';
import { v } from '../../theme';

const Placeholder = styled.div`
  height: 4rem;
  @media (${v.minLaptop}) {
    height: 3.5rem;
  }
`;

const Bar = styled.header<{ isAtTop: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: ${v.zFixed};
  background-color: transparent;
  transition: box-shadow 0.2s, background-color 0.2s;

  ${({ isAtTop }) =>
    !isAtTop &&
    css`
      ${shadow}
      ${translucent}
    `}

  height: 4rem;
  @media (${v.minLaptop}) {
    height: 3.5rem;
  }
`;

const BarWrapper = styled(EdgePadding)`
  height: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;

  > :not(:first-child) {
    margin-left: ${v.spacerS};
  }
  @media (${v.minTablet}) {
    > :not(:first-child) {
      margin-left: ${v.spacerM};
    }
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-grow: 1;

  > :not(:last-child) {
    margin-right: ${v.spacerXS};
  }

  > :last-child {
    margin-right: 0;
  }
`;

const EndNav = styled(Nav)`
  flex-grow: 0;
`;

const OverlayContainer = styled(EdgePadding)`
  position: fixed;
  top: calc(4rem + ${v.spacerXS});
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
  z-index: ${v.zFixed};

  @media (${v.minLaptop}) {
    top: calc(3.5rem + ${v.spacerXS});
  }
`;

const Overlay = styled.div`
  ${card}
  ${translucent}
  pointer-events:all;
  display: flex;
  flex-direction: column;
  padding: ${v.spacerXS};
  width: 100%;

  @media (${v.minTablet}) {
    width: auto;
    min-width: 15rem;
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
        <BarWrapper>
          {logo && <div>{logo}</div>}
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
            <EndNav>
              <Button
                data-testid="top-bar-menu"
                icon={<RiMenuLine />}
                onClick={() => setShowMenu((val) => !val)}
                compact
              />
            </EndNav>
          )}
        </BarWrapper>
      </Bar>
      {menu && showMenu && (
        <OverlayContainer>
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
        </OverlayContainer>
      )}
    </Placeholder>
  );
}

export default TopBar;
