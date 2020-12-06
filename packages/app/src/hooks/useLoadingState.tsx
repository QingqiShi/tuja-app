import {
  useState,
  useContext,
  createContext,
  Dispatch,
  SetStateAction,
} from 'react';

const LoadingStateContext = createContext<
  [boolean, Dispatch<SetStateAction<boolean>>]
>([false, () => {}]);

export function LoadingStateProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const loadingState = useState(false);

  return (
    <LoadingStateContext.Provider value={loadingState}>
      {children}
    </LoadingStateContext.Provider>
  );
}

function useLoadingState() {
  return useContext(LoadingStateContext);
}

export default useLoadingState;
