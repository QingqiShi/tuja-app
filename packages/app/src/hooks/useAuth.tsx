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
import { logEvent, setAnalyticsUser } from 'libs/analytics';

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
  authError: '',
});

export function AuthProvider({ children }: React.PropsWithChildren<{}>) {
  const [currentUser, setCurrentUser] = useState<
    firebase.User | null | undefined
  >(undefined);
  const receivedState = useRef(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState('');

  // Auth state listener
  useEffect(() => {
    return firebase.auth().onAuthStateChanged(async (user) => {
      if (!receivedState.current) {
        receivedState.current = true;
      }
      setCurrentUser(user);
      const idTokenResult = await user?.getIdTokenResult();
      setIsAdmin(!!idTokenResult?.claims.admin);
      setAuthError('');

      // Analytics
      if (user) {
        setAnalyticsUser(user);
      }
    });
  }, [receivedState]);

  // Handle email sign in
  const href = window.location.href;
  const isEmailLink = useMemo(
    () => firebase.auth().isSignInWithEmailLink(href),
    [href]
  );
  const [pendingEmail, setPendingEmail] = useState(initialPendingEmail ?? '');
  useEffect(() => {
    if (isEmailLink && pendingEmail) {
      (async () => {
        setAuthError('');
        try {
          const result = await firebase
            .auth()
            .signInWithEmailLink(pendingEmail, window.location.href);

          window.localStorage.removeItem(STORAGE_KEY);
          window.location.search = '';

          // Analytics
          if (result.additionalUserInfo?.isNewUser) {
            logEvent('sign_up', { method: 'email_link' });
          }
          logEvent('login', { method: 'email_link' });
        } catch (error) {
          switch (error.code) {
            case 'auth/expired-action-code':
            case 'auth/invalid-email':
            case 'auth/user-disabled':
            default:
              setAuthError(error.message);
          }
        }
      })();
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
      setAuthError('');
      await firebase.auth().sendSignInLinkToEmail(email, {
        url: window.location.href,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(STORAGE_KEY, email);
      setPendingEmail(email);

      // Analytics
      logEvent('send_sign_in_link');
    } catch (error) {
      switch (error.code) {
        case 'auth/argument-error':
        case 'auth/invalid-email':
        case 'auth/missing-android-pkg-name':
        case 'auth/missing-continue-uri':
        case 'auth/missing-ios-bundle-id':
        case 'auth/invalid-continue-uri':
        case 'auth/unauthorized-continue-uri':
        default:
          setAuthError(error.message);
      }
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
    setAuthError('');
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    setAuthError('');

    try {
      const result = await firebase.auth().signInWithPopup(provider);

      // Analytics
      if (result.additionalUserInfo?.isNewUser) {
        logEvent('sign_up', { method: 'email_link' });
      }
      logEvent('login', { method: 'email_link' });
    } catch (error) {
      switch (error.code) {
        case 'auth/account-exists-with-different-credential':
        case 'auth/auth-domain-config-required':
        case 'auth/cancelled-popup-request':
        case 'auth/operation-not-allowed':
        case 'auth/operation-not-supported-in-this-environment':
        case 'auth/popup-blocked':
        case 'auth/popup-closed-by-user':
        case 'auth/unauthorized-domain':
        default:
          setAuthError(error.message);
      }
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    const provider = new firebase.auth.GithubAuthProvider();
    setAuthError('');

    try {
      const result = await firebase.auth().signInWithPopup(provider);

      // Analytics
      if (result.additionalUserInfo?.isNewUser) {
        logEvent('sign_up', { method: 'email_link' });
      }
      logEvent('login', { method: 'email_link' });
    } catch (error) {
      switch (error.code) {
        case 'auth/account-exists-with-different-credential':
        case 'auth/auth-domain-config-required':
        case 'auth/cancelled-popup-request':
        case 'auth/operation-not-allowed':
        case 'auth/operation-not-supported-in-this-environment':
        case 'auth/popup-blocked':
        case 'auth/popup-closed-by-user':
        case 'auth/unauthorized-domain':
        default:
          setAuthError(error.message);
      }
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
        authError,
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
