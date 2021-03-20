import { Helmet } from 'react-helmet-async';
import SettingsList from '../../components/SettingsList';
import useScrollToTopOnMount from '../../hooks/useScrollToTopOnMount';

function Create() {
  useScrollToTopOnMount();

  return (
    <>
      <Helmet>
        <title>Settings | Tuja App</title>
      </Helmet>
      <SettingsList />
    </>
  );
}

export default Create;
