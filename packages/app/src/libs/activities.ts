interface DepositActivity {
  date: Date;
  type: 'Deposit';
  amount: number;
}

interface TradeActivity {
  date: Date;
  type: 'Trade';
  trades: { ticker: string; units: number }[];
  cost: number;
}

interface DividendActivity {
  date: Date;
  type: 'Dividend';
  ticker: string;
  amount: number;
}

interface StockDividendActivity {
  date: Date;
  type: 'StockDividend';
  ticker: string;
  units: number;
}

export type Activity =
  | DepositActivity
  | TradeActivity
  | DividendActivity
  | StockDividendActivity;

export interface ActivityFormProps {
  currency: string;
  initialActivity?: Activity;
  onClose?: () => void;
  onSubmit?: (activity: Activity) => Promise<void>;
  onDelete?: () => Promise<void>;
}
