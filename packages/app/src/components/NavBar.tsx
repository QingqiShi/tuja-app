import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useClickAway } from 'react-use';
import styled from 'styled-components/macro';
import { FaUserCircle } from 'react-icons/fa';
import {
  RiLogoutBoxRLine,
  RiPieChartLine,
  RiFileListLine,
  RiMenuAddLine,
  RiDeleteBinLine,
  RiArrowLeftRightLine,
} from 'react-icons/ri';
import { Modal, TopBar, Type } from '@tuja/components';
import { theme } from 'theme';
import useAuth from 'hooks/useAuth';
import usePortfolio from 'hooks/usePortfolio';
import { updatePortfolioBenchmark } from 'libs/portfolio';
import { getDB, clearCache } from 'workers/modules/cachedStocksData';
import SignIn from './SignIn';
import SetBenchmarkForm from './SetBenchmarkForm';

const PopOut = styled.div`
  position: fixed;
  z-index: 200;
  top: calc(4rem + ${theme.spacings('xs')});
  right: ${theme.spacings('xs')};

  @media (${theme.breakpoints.minTablet}) {
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

const Title = styled(Type)`
  position: relative;
  display: inline-block;
  margin-right: 2em;
  font-weight: 800;
  user-select: none;
  color: ${theme.colors.textOnBackground};
`;

const BetaBadge = styled.span`
  font-size: 0.5em;
  font-weight: ${theme.fonts.ctaWeight};
  line-height: ${theme.fonts.ctaHeight};
  letter-spacing: ${theme.fonts.ctaSpacing};
  text-transform: uppercase;
  position: absolute;
  right: -0.3em;
  top: 0;
  width: 0;
`;

const ModalContainer = styled.div`
  width: 400px;
  max-width: 100%;
  text-align: center;
  position: relative;
`;

interface NavBarProps {
  showSignIn?: boolean;
  setShowSignIn?: React.Dispatch<React.SetStateAction<boolean>>;
}

function NavBar({ showSignIn, setShowSignIn }: NavBarProps) {
  const { state, signOut } = useAuth();
  const { portfolio } = usePortfolio();
  const location = useLocation();

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

  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);

  const links: React.ComponentProps<typeof TopBar>['links'] = [];
  const endLinks: React.ComponentProps<typeof TopBar>['links'] = [];
  const menu: React.ComponentProps<typeof TopBar>['links'] = [];

  if (state === 'SIGNED_IN' && portfolio) {
    links.push({
      children: 'Portfolio',
      startIcon: <RiPieChartLine />,
      as: Link as any,
      otherProps: { to: `/portfolio/${portfolio.id}` },
      active: location.pathname === `/portfolio/${portfolio.id}`,
    });
    links.push({
      children: 'Activities',
      startIcon: <RiFileListLine />,
      as: Link as any,
      otherProps: {
        to: `/portfolio/${portfolio.id}/activities`,
      },
      active: location.pathname === `/portfolio/${portfolio.id}/activities`,
    });
  }

  if (state === 'SIGNED_IN') {
    menu.push({
      children: 'Set benchmark',
      startIcon: <RiArrowLeftRightLine />,
      onClick: () => setShowBenchmarkModal(true),
    });
    menu.push({
      children: 'Create portfolio',
      startIcon: <RiMenuAddLine />,
      as: Link as any,
      otherProps: {
        to: portfolio
          ? `/portfolio/${portfolio.id}/create-portfolio`
          : '/create-portfolio',
      },
      active:
        location.pathname ===
        (portfolio
          ? `/portfolio/${portfolio.id}/create-portfolio`
          : '/create-portfolio'),
    });
    menu.push({
      children: 'Clear cache',
      startIcon: <RiDeleteBinLine />,
      onClick: async () => {
        const db = await getDB();
        await clearCache(db);
        window.location.reload();
      },
    });
    menu.push({
      children: 'Sign out',
      startIcon: <RiLogoutBoxRLine />,
      onClick: signOut,
    });
  }

  if (state !== 'SIGNED_IN') {
    endLinks.push({
      children: 'Sign in',
      startIcon: <FaUserCircle />,
      variant: 'shout',
      onClick: () => (setShowSignIn ?? setInternalShow)((val) => !val),
    });
  }

  return (
    <>
      <TopBar
        links={links}
        endLinks={endLinks}
        menu={menu}
        logo={
          <Link to="/">
            <Title scale="h6" noMargin>
              Tuja <BetaBadge>beta</BetaBadge>
            </Title>
          </Link>
        }
      />
      {(showSignIn ?? internalShow) && (
        <PopOut>
          <SignIn ref={popOutRef} />
        </PopOut>
      )}
      {showBenchmarkModal && portfolio && (
        <Modal onClose={() => setShowBenchmarkModal(false)}>
          <ModalContainer>
            <Type scale="h5">Portfolio Benchmark</Type>
            <SetBenchmarkForm
              defaultBenchmark={portfolio.benchmark}
              onClose={() => setShowBenchmarkModal(false)}
              onSubmit={(benchmark) =>
                updatePortfolioBenchmark(portfolio.id, benchmark)
              }
              onDelete={() => updatePortfolioBenchmark(portfolio.id, '')}
            />
          </ModalContainer>
        </Modal>
      )}
    </>
  );
}

export default NavBar;
