import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  Dispatch,
  SetStateAction,
} from 'react';
import dayjs from 'dayjs';
import usePortfolio from 'hooks/usePortfolio';

const StartDateContext = createContext<
  [Date | null, Dispatch<SetStateAction<Date | null>>]
>([null, () => {}]);

const currentDate = dayjs(dayjs().format('YYYY-MM-DD'));
const defaultDate = currentDate.subtract(3, 'month');

export function StartDateProvider({ children }: React.PropsWithChildren<{}>) {
  const { portfolio } = usePortfolio();

  const startDateState = useState<Date | null>(null);

  useEffect(() => {
    const [startDate] = startDateState;
    const portfolioStartDate = portfolio?.activities[0]?.date;
    if (!startDate && portfolioStartDate) {
      startDateState[1](
        defaultDate.isAfter(portfolioStartDate)
          ? defaultDate.toDate()
          : portfolioStartDate
      );
    }
  }, [portfolio?.activities, startDateState]);

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
