import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { Logo, Modal, TopBar, Type } from '@tuja/components';
import useAuth from 'hooks/useAuth';
import usePortfolio from 'hooks/usePortfolio';
import { updatePortfolioBenchmark } from 'libs/portfolioClient';
import { getDB, clearCache } from 'libs/cachedStocksData';
import SetBenchmarkForm from './SetBenchmarkForm';

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
      as: Link as any,
      otherProps: {
        to: '/signin',
      },
    });
  }

  return (
    <>
      <TopBar
        links={links}
        endLinks={location.pathname !== '/signin' ? endLinks : []}
        menu={menu}
        logo={
          <Link to="/">
            <Logo />
          </Link>
        }
      />
      {portfolio && (
        <Modal
          onClose={() => setShowBenchmarkModal(false)}
          open={showBenchmarkModal}
        >
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
