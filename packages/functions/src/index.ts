import * as admin from 'firebase-admin';

admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });

export {
  searchStocks,
  stockLivePrice,
  stockHistory,
  stocksInfo,
  stocksPrices,
} from './functions/stocksData';
