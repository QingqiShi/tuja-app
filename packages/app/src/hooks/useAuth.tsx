import {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import firebase from 'firebase/app';
import { logEvent } from 'libs/analytics';

const STORAGE_KEY = 'pendingSignInEmail';

const initialPendingEmail = window.localStorage.getItem(STORAGE_KEY);

type AuthState =
  | 'UNKNOWN'
  | 'SIGNED_OUT'
  | 'SIGNED_IN'
  | 'EMAIL_SENT'
  | 'CONFIRM_EMAIL'
  | 'SIGNING_IN';

export const AuthContext = createContext({
  signIn: async (_email: string) => {},
  signOut: () => {},
  confirmEmail: (_email: string) => {},
  reset: () => {},
  signInWithGoogle: async () => {},
  signInWithGithub: async () => {},
  state: 'SIGNED_OUT' as AuthState,
  currentUser: null as firebase.User | null | undefined,
  isAdmin: false,
});

export function AuthProvider({ children }: React.PropsWithChildren<{}>) {
  const isEmailLink = useMemo(
    () => firebase.auth().isSignInWithEmailLink(window.location.href),
    []
  );
  const [pendingEmail, setPendingEmail] = useState(initialPendingEmail ?? '');
  const [currentUser, setCurrentUser] = useState<
    firebase.User | null | undefined
  >(undefined);
  const receivedState = useRef(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(async (user) => {
      if (!receivedState.current) {
        receivedState.current = true;
      }
      setCurrentUser(user);
      const idTokenResult = await user?.getIdTokenResult();
      setIsAdmin(!!idTokenResult?.claims.admin);

      // Analytics
      if (user) {
        firebase.analytics().setUserId(user.uid);
      }
    });
  }, [receivedState]);

  useEffect(() => {
    if (isEmailLink && pendingEmail) {
      firebase
        .auth()
        .signInWithEmailLink(pendingEmail, window.location.href)
        .then((result) => {
          window.localStorage.removeItem(STORAGE_KEY);
          window.location.search = '';

          // Analytics
          if (result.additionalUserInfo?.isNewUser) {
            logEvent('sign_up', { method: 'email_link' });
          }
          logEvent('login', { method: 'email_link' });
        });
    }
  }, [isEmailLink, pendingEmail]);

  const state = useMemo(() => {
    if (!receivedState.current) return 'UNKNOWN' as const;
    if (currentUser) return 'SIGNED_IN' as const;
    if (!pendingEmail && !isEmailLink) return 'SIGNED_OUT' as const;
    if (pendingEmail && !isEmailLink) return 'EMAIL_SENT' as const;
    if (isEmailLink && !pendingEmail) return 'CONFIRM_EMAIL' as const;
    return 'SIGNING_IN';
  }, [currentUser, isEmailLink, pendingEmail]);

  const signIn = useCallback(async (email: string) => {
    try {
      await firebase.auth().sendSignInLinkToEmail(email, {
        url: window.location.href,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(STORAGE_KEY, email);
      setPendingEmail(email);

      // Analytics
      logEvent('send_sign_in_link');
    } catch (e) {
      console.error(e);
    }
  }, []);

  const signOut = useCallback(() => firebase.auth().signOut(), []);

  const confirmEmail = useCallback(
    (email: string) => setPendingEmail(email),
    []
  );

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setPendingEmail('');
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
      const result = await firebase.auth().signInWithPopup(provider);

      // Analytics
      if (result.additionalUserInfo?.isNewUser) {
        logEvent('sign_up', { method: 'email_link' });
      }
      logEvent('login', { method: 'email_link' });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    const provider = new firebase.auth.GithubAuthProvider();

    try {
      const result = await firebase.auth().signInWithPopup(provider);

      // Analytics
      if (result.additionalUserInfo?.isNewUser) {
        logEvent('sign_up', { method: 'email_link' });
      }
      logEvent('login', { method: 'email_link' });
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        confirmEmail,
        reset,
        signInWithGoogle,
        signInWithGithub,
        state,
        currentUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

export default useAuth;
