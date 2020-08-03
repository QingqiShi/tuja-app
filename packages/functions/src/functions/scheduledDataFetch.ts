import * as functions from 'firebase-functions';
import { error } from 'firebase-functions/lib/logger';
import * as admin from 'firebase-admin';
import { PubSub } from '@google-cloud/pubsub';
import { fetchTickerInfo } from '../modules/fetchTickerInfo';

const PUBSUB_TOPIC = 'crawl-stock-info';
const db = admin.firestore();

export const crawlStockData = functions.pubsub
  .topic(PUBSUB_TOPIC)
  .onPublish(async (message) => {
    const ticker = message.json.ticker;
    console.log(`crawling data for: ${ticker}`);

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const dateKey = `${year}-${month < 10 ? `0${month}` : month}-${
      day < 10 ? `0${day}` : day
    }`;

    const result = await fetchTickerInfo(ticker);
    if (!result) {
      error('crawling data for: ${ticker} (failed)');
      return;
    }

    const stockDocRef = db.collection('stocks').doc(ticker);
    await stockDocRef.set(result);

    const yearDocRef = db.doc(
      `stocks/${ticker}/history/${currentDate.getFullYear()}`
    );
    await db.runTransaction(async (t) => {
      const doc = await t.get(yearDocRef);
      if (!doc.exists) {
        t.set(yearDocRef, { [dateKey]: result.quote ?? 0 });
      } else {
        t.set(yearDocRef, {
          ...doc.data(),
          [dateKey]: result.quote ?? 0,
        });
      }
    });
    console.log(`crawling data for: ${ticker} (finished)`);
  });

export const scheduledDataFetch = functions.pubsub
  .schedule('0 4,6,8,10,12,14,16,20 * * 1-5')
  .timeZone('America/New_York')
  .onRun(async () => {
    const collectionRef = db.collection('stocks');
    const collection = await collectionRef.get();
    const tickers: string[] = collection.docs.map((doc) => doc.id);

    const pubSubClient = new PubSub();

    await Promise.all(
      tickers.map(async (ticker) => {
        await pubSubClient.topic(PUBSUB_TOPIC).publishJSON({ ticker });
      })
    );
  });
