import { useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components/macro';
import { ButtonBase, EdgePadding, PageTitle, v } from '@tuja/components';
import useAuth from 'hooks/useAuth';
import useScrollToTopOnMount from 'hooks/useScrollToTopOnMount';
import { getDB, clearCache } from 'libs/cachedStocksData';

const SettingOption = styled(ButtonBase)`
  padding: ${v.spacerS} ${v.spacerM};
  border-radius: ${v.radiusMedia};
  background: ${v.backgroundRaised};
  color: ${v.textMain};
  box-shadow: ${v.shadowRaised};
  width: 100%;
  transition: transform 0.2s, background 0.2s, box-shadow 0.2s;

  &:hover {
    box-shadow: ${v.shadowOverlay};
    transform: translateY(-0.1rem);
  }

  &:active {
    box-shadow: ${v.shadowRaised};
    background-color: ${v.backgroundOverlay};
  }

  &:not(:last-child) {
    margin-bottom: ${v.spacerXS};
  }
`;

function Create() {
  const history = useHistory();
  const { signOut } = useAuth();
  useScrollToTopOnMount();

  return (
    <>
      <Helmet>
        <title>Settings | Tuja App</title>
      </Helmet>
      <EdgePadding>
        <PageTitle>Settings</PageTitle>
        <SettingOption
          href="/create-portfolio"
          onClick={() => history.push('/create-portfolio')}
        >
          Create portfolio
        </SettingOption>
        <SettingOption
          onClick={async () => {
            const db = await getDB();
            await clearCache(db);
            window.location.reload();
          }}
        >
          Clear cache
        </SettingOption>
        <SettingOption onClick={signOut}>Sign out</SettingOption>
      </EdgePadding>
    </>
  );
}

export default Create;
