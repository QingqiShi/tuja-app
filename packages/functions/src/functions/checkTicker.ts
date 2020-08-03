import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { fetchTickerInfo } from '../modules/fetchTickerInfo';

const FIFTEEN_MINUTES = 900_000;
const db = admin.firestore();

export const checkTicker = functions.https.onCall(async (data, { auth }) => {
  if (!auth || !auth.token.admin) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Only admin user may call this function'
    );
  }

  const { ticker } = data;
  if (typeof ticker !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'You need to specify the stock ticker'
    );
  }

  const docRef = db.collection('stocks').doc(ticker);
  const doc = await docRef.get();

  if (
    !doc.exists ||
    Date.now() - (doc.data()?.timestamp ?? 0) > FIFTEEN_MINUTES
  ) {
    const result = await fetchTickerInfo(ticker);
    if (result) {
      await docRef.set(result);
      return result;
    } else {
      throw new functions.https.HttpsError(
        'not-found',
        'Could not fetch data from data source'
      );
    }
  } else {
    return doc.data();
  }
});
