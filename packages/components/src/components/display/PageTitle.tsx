import styled from 'styled-components';
import { CaretLeft } from 'phosphor-react';
import { v } from '../../theme';
import React from 'react';

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: ${v.fontSemiBold};
  margin: 0;
`;

const BackButton = styled.a`
  color: ${v.accentMain};
  font-weight: ${v.fontBold};
  font-size: 1rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  margin-bottom: 1rem;

  > :first-child {
    margin-right: ${v.spacerXS};
  }

  &:hover {
    color: ${v.accentHover};
  }
`;

interface PageTitleProps {
  backButtonLabel?: string;
  backHref?: string;
  onBack?: (e: React.MouseEvent) => void;
}

function PageTitle({
  children,
  backButtonLabel,
  backHref,
  onBack,
}: React.PropsWithChildren<PageTitleProps>) {
  return (
    <div>
      {backButtonLabel && (
        <BackButton
          href={backHref}
          onClick={(e) => {
            if (onBack) {
              e.preventDefault();
              onBack(e);
            }
          }}
        >
          <CaretLeft size="1rem" weight="bold" />
          {backButtonLabel}
        </BackButton>
      )}
      <Title>{children}</Title>
    </div>
  );
}

export default PageTitle;
