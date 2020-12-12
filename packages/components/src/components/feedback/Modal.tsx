import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { card } from '../../mixins';

const Container = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) =>
    `calc(${theme.spacings.s} + env(safe-area-inset-top)) ${theme.spacings.s} calc(${theme.spacings.s} + env(safe-area-inset-bottom))`};
  z-index: ${({ theme }) => theme.zIndex.fixed};
`;

const Backdrop = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: ${({ theme }) => theme.zIndex.fixed};
  background-color: ${({ theme }) =>
    transparentize(0.1, theme.colors.backgroundMain)};
`;

const ModalCard = styled.div<{
  padding?: boolean;
  minWidth?: number;
  maxWidth?: number;
}>`
  ${card}
  max-height: 100%;
  overflow: auto;
  z-index: ${({ theme }) => theme.zIndex.modal};
  ${({ padding, theme }) =>
    padding &&
    css`
      padding: ${theme.spacings.m};
    `}
  ${({ minWidth }) =>
    minWidth &&
    css`
      min-width: min(${minWidth}rem, 100%);
    `}
  ${({ maxWidth }) =>
    maxWidth
      ? css`
          max-width: ${maxWidth}rem;
        `
      : css`
          max-width: 100%;
        `}
`;

interface ModalProps {
  onClose?: () => void;
  padding?: boolean;
  minWidth?: number;
  maxWidth?: number;
  width?: number;
}

function Modal({
  onClose,
  padding = true,
  minWidth,
  maxWidth,
  width,
  children,
}: React.PropsWithChildren<ModalProps>) {
  const ref = useBodyScrollLock(true);
  return (
    <Container>
      <Backdrop onClick={onClose} />
      <ModalCard
        ref={ref}
        padding={padding}
        minWidth={minWidth ?? width}
        maxWidth={maxWidth ?? width}
      >
        {children}
      </ModalCard>
    </Container>
  );
}

export default Modal;
