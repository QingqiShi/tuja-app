import styled from 'styled-components';
import { v } from '../../theme';

const EdgePadding = styled.div`
  width: 100%;
  max-width: ${v.maxLayoutWidth};
  padding-left: calc(env(safe-area-inset-left) + ${v.leftRightPadding});
  padding-right: calc(env(safe-area-inset-right) + ${v.leftRightPadding});
  margin: 0 auto;
`;

export default EdgePadding;
