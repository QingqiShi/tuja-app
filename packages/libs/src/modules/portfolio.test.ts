import { portfolioToDb, portfolioFromDb } from './portfolio';

const date = new Date(1610667699930);
const dbDate = '2021-01-14';
const dateNoTime = new Date(1610582400000);

test('portfolioToDb', () => {
  expect(
    portfolioToDb({
      id: 'testId',
      name: 'test portfolio',
      user: 'userId',
      currency: 'GBP',
      aliases: { 'AAPL.US': 'Apple' },
      activitiesStartDate: date,
    })
  ).toEqual({
    id: 'testId',
    name: 'test portfolio',
    user: 'userId',
    currency: 'GBP',
    aliases: { 'AAPL.US': 'Apple' },
    activitiesStartDate: dbDate,
  });
});

test('portfolioToDb with snapshot', () => {
  expect(
    portfolioToDb({
      id: 'testId',
      name: 'test portfolio',
      user: 'userId',
      currency: 'GBP',
      aliases: { 'AAPL.US': 'Apple' },
      activitiesStartDate: date,
      latestSnapshot: {
        date: date,
        cashFlow: 100,
        cash: 100,
        dividend: 100,
        numShares: {},
      },
    })
  ).toEqual({
    id: 'testId',
    name: 'test portfolio',
    user: 'userId',
    currency: 'GBP',
    aliases: { 'AAPL.US': 'Apple' },
    activitiesStartDate: dbDate,
    latestSnapshot: {
      date: dbDate,
      cashFlow: 100,
      cash: 100,
      dividend: 100,
      numShares: {},
    },
  });
});

test('portfolioFromDb', () => {
  expect(
    portfolioFromDb({
      id: 'testId',
      name: 'test portfolio',
      user: 'userId',
      currency: 'GBP',
      aliases: { 'AAPL.US': 'Apple' },
      activitiesStartDate: dbDate,
    })
  ).toEqual({
    id: 'testId',
    name: 'test portfolio',
    user: 'userId',
    currency: 'GBP',
    aliases: { 'AAPL.US': 'Apple' },
    activitiesStartDate: dateNoTime,
  });
});

test('portfolioFromDb with snapshot', () => {
  expect(
    portfolioFromDb({
      id: 'testId',
      name: 'test portfolio',
      user: 'userId',
      currency: 'GBP',
      aliases: { 'AAPL.US': 'Apple' },
      activitiesStartDate: dbDate,
      latestSnapshot: {
        date: dbDate,
        cashFlow: 100,
        cash: 100,
        dividend: 100,
        numShares: {},
      },
    })
  ).toEqual({
    id: 'testId',
    name: 'test portfolio',
    user: 'userId',
    currency: 'GBP',
    aliases: { 'AAPL.US': 'Apple' },
    activitiesStartDate: dateNoTime,
    latestSnapshot: {
      date: dateNoTime,
      cashFlow: 100,
      cash: 100,
      dividend: 100,
      numShares: {},
    },
  });
});

test('portfolioFromDb without activities (no activitiesStartDate)', () => {
  expect(
    portfolioFromDb({
      id: 'testId',
      name: 'test portfolio',
      user: 'userId',
      currency: 'GBP',
      aliases: { 'AAPL.US': 'Apple' },
    })
  ).toEqual({
    id: 'testId',
    name: 'test portfolio',
    user: 'userId',
    currency: 'GBP',
    aliases: { 'AAPL.US': 'Apple' },
  });
});
