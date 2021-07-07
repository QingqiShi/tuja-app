interface Window {
  firestoreConfigured: boolean;
}

declare module 'idb-latest' {
  export * from 'idb';
}

declare module 'fake-indexeddb/lib/FDBFactory' {
  class FDBFactory {}
  export default FDBFactory;
}

interface AnalyticsProps {
  assets: {
    ticker: string;
    label: string;
    percentage: number;
    color: string;
  }[];
  baseCurrency: string;
  inflationRate: number;
  shouldSkip?: boolean;
}
