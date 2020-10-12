import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useClickAway, useMedia } from 'react-use';
import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import { FaUserCircle } from 'react-icons/fa';
import {
  RiLogoutBoxRLine,
  RiPieChartLine,
  RiFileListLine,
  RiMenuAddLine,
} from 'react-icons/ri';
import { theme, getTheme } from 'theme';
import useAuth from 'hooks/useAuth';
import usePortfolio from 'hooks/usePortfolio';
import Button from './Button';
import SignIn from './SignIn';

const Nav = styled.nav`
  position: sticky;
  top: 0;
  width: 100%;
  height: 5rem;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  z-index: 400;
  padding: 0 ${theme.spacings('xs')};
  background-color: ${theme.colors.backgroundMain};
  box-shadow: 0 0 0 1px
    ${getTheme(theme.colors.textOnBackground, (color) =>
      transparentize(0.9, color)
    )};

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

const PopOut = styled.div`
  position: absolute;
  right: ${theme.spacings('s')};
  top: calc(5rem + ${theme.spacings('s')});
`;

const Spacer = styled.div`
  flex-grow: 1;
`;

interface NavButtonProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  to: string;
}

function NavButton({ icon, children, to }: NavButtonProps) {
  const location = useLocation();
  const isLaptop = useMedia(`(${theme.breakpoints.minLaptop})`);
  return (
    <Button
      to={to}
      startIcon={isLaptop ? icon : undefined}
      icon={isLaptop ? undefined : icon}
      disabled={location.pathname === to}
    >
      {children}
    </Button>
  );
}

interface NavBarProps {
  showSignIn?: boolean;
  setShowSignIn?: React.Dispatch<React.SetStateAction<boolean>>;
}

function NavBar({ showSignIn, setShowSignIn }: NavBarProps) {
  const { state, signOut } = useAuth();
  const { portfolio } = usePortfolio();

  const [internalShow, setInternalShow] = useState(false);

  const popOutRef = useRef<HTMLDivElement>(null);
  useClickAway(popOutRef, () => (setShowSignIn ?? setInternalShow)(false));

  useEffect(() => {
    if (
      state === 'CONFIRM_EMAIL' ||
      state === 'SIGNING_IN' ||
      state === 'EMAIL_SENT'
    ) {
      (setShowSignIn ?? setInternalShow)(true);
    }
  }, [setShowSignIn, state]);

  return (
    <Nav>
      {state === 'SIGNED_IN' ? (
        <>
          {portfolio && (
            <>
              <NavButton icon={<RiPieChartLine />} to="/portfolio">
                Portfolio
              </NavButton>
              <NavButton icon={<RiFileListLine />} to="/activities">
                Activities
              </NavButton>
            </>
          )}

          <Spacer />

          <Button icon={<RiMenuAddLine />} to="/create-portfolio" />
          <Button onClick={signOut} icon={<RiLogoutBoxRLine />} />
        </>
      ) : (
        <Button
          startIcon={<FaUserCircle />}
          onClick={() => (setShowSignIn ?? setInternalShow)((val) => !val)}
        >
          Sign in
        </Button>
      )}
      {(showSignIn ?? internalShow) && (
        <PopOut>
          <SignIn ref={popOutRef} />
        </PopOut>
      )}
    </Nav>
  );
}

export default NavBar;
