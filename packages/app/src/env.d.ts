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
