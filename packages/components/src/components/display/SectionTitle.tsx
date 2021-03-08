import styled from 'styled-components';
import { v } from '../../theme';
import React from 'react';

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: ${v.fontSemiBold};
  margin: 0;
`;

function SectionTitle({ children }: React.PropsWithChildren<{}>) {
  return <Title>{children}</Title>;
}

export default SectionTitle;
