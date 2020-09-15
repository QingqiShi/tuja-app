import * as admin from 'firebase-admin';

admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });

export { checkTicker } from './functions/checkTicker';
export {
  scheduledDataFetch,
  crawlStockData,
} from './functions/scheduledDataFetch';
export {
  addToStocksList,
  removeFromStocksList,
} from './functions/aggregateStocks';
export {
  searchStocks,
  stockLivePrice,
  stockHistory,
  getStocksInfo,
} from './functions/stocksData';
