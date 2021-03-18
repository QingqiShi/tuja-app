import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import minMax from 'dayjs/plugin/minMax';
import { listener } from './processor';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(minMax);

/**
 * Worker entry point
 */
// eslint-disable-next-line no-restricted-globals
addEventListener('message', (event) => listener(event, postMessage));
