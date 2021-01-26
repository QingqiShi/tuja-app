import * as admin from 'firebase-admin';

admin.initializeApp();
admin.firestore().settings({ ignoreUndefinedProperties: true });

export { aggregateActivities } from './functions/aggregateActivities';
