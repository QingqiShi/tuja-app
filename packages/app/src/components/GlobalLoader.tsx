import useLoadingState from 'hooks/useLoadingState';
import { TopLinearLoader } from '@tuja/components';

function GlobalLoader() {
  const [loading] = useLoadingState();
  if (!loading) {
    return null;
  }
  return <TopLinearLoader />;
}

export default GlobalLoader;
