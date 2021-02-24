import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import firebase from 'firebase/app';
import { setAnalyticsUser } from 'libs/analytics';

type AuthState = 'UNKNOWN' | 'SIGNED_OUT' | 'SIGNED_IN';

export const AuthContext = createContext({
  state: 'SIGNED_OUT' as AuthState,
  currentUser: null as firebase.User | null | undefined,
  isAdmin: false,
  signOut: () => {},
});

export function AuthProvider({ children }: React.PropsWithChildren<{}>) {
  const [state, setState] = useState<AuthState>('UNKNOWN');
  const [currentUser, setCurrentUser] = useState<
    firebase.User | null | undefined
  >(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  // Auth state listener
  useEffect(() => {
    return firebase.auth().onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      const idTokenResult = await user?.getIdTokenResult();
      setIsAdmin(!!idTokenResult?.claims.admin);

      if (user) {
        setState('SIGNED_IN');
        // Analytics
        setAnalyticsUser(user);
      } else {
        setState('SIGNED_OUT');
      }
    });
  }, []);

  const signOut = useCallback(() => firebase.auth().signOut(), []);

  return (
    <AuthContext.Provider
      value={{
        state,
        currentUser,
        isAdmin,
        signOut,
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
