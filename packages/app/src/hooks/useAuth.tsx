import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import { auth } from 'firebase/app';

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
  state: 'SIGNED_OUT' as AuthState,
  currentUser: null as firebase.User | null | undefined,
  isAdmin: false,
});

export function AuthProvider({ children }: React.PropsWithChildren<{}>) {
  const isEmailLink = useMemo(
    () => auth().isSignInWithEmailLink(window.location.href),
    []
  );
  const [pendingEmail, setPendingEmail] = useState(initialPendingEmail ?? '');
  const [currentUser, setCurrentUser] = useState<
    firebase.User | null | undefined
  >(undefined);
  const receivedState = useRef(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    return auth().onAuthStateChanged(async (user) => {
      if (!receivedState.current) {
        receivedState.current = true;
      }
      setCurrentUser(user);
      const idTokenResult = await user?.getIdTokenResult();
      setIsAdmin(!!idTokenResult?.claims.admin);
    });
  }, [receivedState]);

  useEffect(() => {
    if (isEmailLink && pendingEmail) {
      auth()
        .signInWithEmailLink(pendingEmail, window.location.href)
        .then(() => {
          window.localStorage.removeItem(STORAGE_KEY);
          window.location.search = '';
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
      await auth().sendSignInLinkToEmail(email, {
        url: window.location.href,
        handleCodeInApp: true,
      });
      window.localStorage.setItem(STORAGE_KEY, email);
      setPendingEmail(email);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const signOut = useCallback(() => auth().signOut(), []);

  const confirmEmail = useCallback(
    (email: string) => setPendingEmail(email),
    []
  );

  const reset = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setPendingEmail('');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        confirmEmail,
        reset,
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
