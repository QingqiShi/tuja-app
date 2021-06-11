import styled from 'styled-components';
import { v } from '../../theme';
import LinearLoader from './LinearLoader';

const TopLinearLoader = styled(LinearLoader)`
  position: fixed;
  z-index: ${v.zFixed + 1};
`;

export default TopLinearLoader;
