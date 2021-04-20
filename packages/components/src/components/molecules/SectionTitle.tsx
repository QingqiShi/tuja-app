import styled from 'styled-components';
import { v } from '../../theme';

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: ${v.fontSemiBold};
  margin: 0 0 ${v.spacerS};
`;

function SectionTitle({ children }: React.PropsWithChildren<{}>) {
  return <Title>{children}</Title>;
}

export default SectionTitle;
