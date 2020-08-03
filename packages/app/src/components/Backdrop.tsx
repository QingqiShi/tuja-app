import React from 'react';
import styled from 'styled-components/macro';
import { transparentize } from 'polished';
import { theme, getTheme } from 'theme';

const BackdropContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: calc(${theme.spacings('s')} + env(safe-area-inset-bottom))
    ${theme.spacings('s')};

  > div:last-child {
    z-index: 100;
    max-height: 100%;
    max-width: 100%;
    overflow: auto;
  }
`;

const BackdropOverlay = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${getTheme(theme.colors.backgroundMain, (c) =>
    transparentize(0.1, c)
  )};
`;

interface BackdropProps {
  onClick?: () => void;
}

function Backdrop({
  children,
  onClick,
}: React.PropsWithChildren<BackdropProps>) {
  return (
    <BackdropContainer>
      <BackdropOverlay onClick={onClick} />
      {children}
    </BackdropContainer>
  );
}

export default Backdrop;
