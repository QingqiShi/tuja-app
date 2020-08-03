import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

export const addToStocksList = functions.firestore
  .document('stocks/{ticker}')
  .onCreate(async (_snap, context) => {
    const ticker: string = context.params.ticker;
    if (!ticker) return;

    const docRef = db.collection('aggregation').doc('stocks');
    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      const tickers: string[] = doc?.data()?.tickers ?? [];
      if (!tickers.includes(ticker)) {
        tickers.push(ticker);
        t.update(docRef, { tickers });
      }
    });
  });

export const removeFromStocksList = functions.firestore
  .document('stocks/{ticker}')
  .onDelete(async (_snap, context) => {
    const ticker: string = context.params.ticker;
    if (!ticker) return;

    const docRef = db.collection('aggregation').doc('stocks');
    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      const tickers =
        doc?.data()?.tickers.filter((current: string) => current !== ticker) ??
        [];
      t.set(docRef, { tickers }, { merge: true });
    });
  });
