interface BaseActivity {
  id: string;
  date: Date;
}

interface DepositActivity extends BaseActivity {
  type: 'Deposit';
  amount: number;
}

interface TradeActivity extends BaseActivity {
  type: 'Trade';
  trades: { ticker: string; units: number }[];
  cost: number;
}

interface DividendActivity extends BaseActivity {
  type: 'Dividend';
  ticker: string;
  amount: number;
}

interface StockDividendActivity extends BaseActivity {
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

export const activityLabels = (activity: Activity) => {
  if (activity.type === 'Trade') {
    return activity.cost >= 0 ? 'Buy' : 'Sell';
  }
  if (activity.type === 'Dividend') {
    return 'Cash Dividend';
  }
  if (activity.type === 'StockDividend') {
    return 'Stock Dividend';
  }
  return activity.type;
};
