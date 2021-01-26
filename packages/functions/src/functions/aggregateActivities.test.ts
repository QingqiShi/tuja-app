import firebaseTest from 'firebase-functions-test';
import * as admin from 'firebase-admin';

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:5002';
const firebase = firebaseTest({
  databaseURL: 'http://localhost:5002/?ns=portfolio-mango',
  projectId: 'portfolio-mango',
});

let aggregateActivities: Function;
beforeEach(() => {
  firebase.mockConfig({ eodhistoricaldata: { token: 'test-api' } });
  const functions = require('../index');
  aggregateActivities = firebase.wrap(functions.aggregateActivities);
});

afterEach(() => {
  firebase.cleanup();
});

test('skip triggered function based on activity field', async () => {
  // Make snapshot for state of database after the change
  const afterSnap = firebase.firestore.makeDocumentSnapshot(
    {
      id: 'sr0jdNWhtuG15zcVzTp7',
      type: 'Deposit',
      date: '2020-10-29',
      amount: 1000,
      skipTrigger: true,
    },
    'portfolios/9alA8EPhEEsn6ta2xPFQ/activities/sr0jdNWhtuG15zcVzTp7'
  );
  const change = firebase.makeChange({ data: () => undefined }, afterSnap);
  await aggregateActivities(change, {
    params: { portfolioId: '9alA8EPhEEsn6ta2xPFQ' },
  });

  const portfolioDoc = await admin
    .firestore()
    .doc('portfolios/9alA8EPhEEsn6ta2xPFQ')
    .get();

  expect(portfolioDoc.data()?.latestSnapshot).toEqual({
    date: '2020-12-12',
    cash: 501.19777500000004,
    cashFlow: 1000,
    numShares: { 'TSLA.US': 2 },
  });
});

// test('test', async () => {
//   // Make snapshot for state of database beforehand
//   const beforeSnap = firebase.firestore.makeDocumentSnapshot(
//     { foo: 'bar' },
//     'document/path'
//   );
//   // Make snapshot for state of database after the change
//   const afterSnap = firebase.firestore.makeDocumentSnapshot(
//     { foo: 'faz' },
//     'document/path'
//   );
//   const change = firebase.makeChange(beforeSnap, afterSnap);
//   await aggregateActivities(change, {
//     params: { portfolioId: 'XiUAMdQLFRn9AvEcfTui' },
//   });
// });
