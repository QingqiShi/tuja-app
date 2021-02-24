import { useEffect, useRef } from 'react';
import styled from 'styled-components/macro';
import firebase from 'firebase/app';
import { auth as uiAuth } from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

const Container = styled.div`
  height: 80vh;
  width: 80vw;
  max-width: 300px;
  margin: 0 auto;

  @media (${({ theme }) => theme.breakpoints.minTablet}) {
    max-width: 400px;
  }

  @media (${({ theme }) => theme.breakpoints.minLaptop}) {
    max-width: 450px;
  }

  h4 {
    margin-top: 0.2em;
  }

  > div {
    padding: ${({ theme }) => theme.spacings.m};
  }

  form {
    text-align: center;
    padding: ${({ theme }) => theme.spacings.m} 0 0;
  }
`;

function UserSignUp() {
  const uiDeleted = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let ui: uiAuth.AuthUI;

    (async () => {
      await uiDeleted.current;
      if (!firebase.apps.length) return;

      ui = new uiAuth.AuthUI(firebase.auth());
      const uiConfig: uiAuth.Config = {
        signInOptions: [
          {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            signInMethod:
              firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
          },
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.GithubAuthProvider.PROVIDER_ID,
        ],
      };
      ui.start('#firebaseui-auth-container', uiConfig);
    })();

    return () => {
      uiDeleted.current = (async () => {
        if (ui) await ui.delete();
      })();
    };
  }, []);

  return (
    <Container>
      <div id="firebaseui-auth-container" />
    </Container>
  );
}

export default UserSignUp;
