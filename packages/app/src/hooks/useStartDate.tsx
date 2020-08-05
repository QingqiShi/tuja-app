import React, {
  useState,
  useContext,
  createContext,
  Dispatch,
  SetStateAction,
} from 'react';

const StartDateContext = createContext<
  [Date | null, Dispatch<SetStateAction<Date | null>>]
>([null, () => {}]);

export function StartDateProvider({ children }: React.PropsWithChildren<{}>) {
  const startDateState = useState<Date | null>(null);
  return (
    <StartDateContext.Provider value={startDateState}>
      {children}
    </StartDateContext.Provider>
  );
}

function useStartDate() {
  return useContext(StartDateContext);
}

export default useStartDate;
