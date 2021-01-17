import { TimeSeries, validateSeries } from './timeSeries';

test('contains raw data', () => {
  const series = new TimeSeries();
  expect(series).toHaveProperty('data');
});

test('construct from plain object', () => {
  const plainObj = {
    data: [
      [new Date(), 5],
      [new Date(), 10],
    ] as [Date, number][],
  };
  const series = new TimeSeries(plainObj);
  expect(series.data).toBe(plainObj.data);
});

test('convert to plain object', () => {
  const plainObj = {
    data: [
      [new Date('2020-12-15T00:00:00.000Z'), 10],
      [new Date('2020-12-30T00:00:00.000Z'), 15],
      [new Date('2021-01-02T00:00:00.000Z'), 20],
    ] as [Date, number][],
  };
  const series = new TimeSeries(plainObj);

  const expected = {
    data: [
      ['2020-12-15', 10],
      ['2020-12-30', 15],
      ['2021-01-02', 20],
    ],
  };
  expect(series.toPlainObject()).toEqual(expected);
});

test('handle api data', () => {
  const series = new TimeSeries();
  const apiData: [string, number][] = [
    ['2020-12-15', 10],
    ['2021-01-02', 20],
    ['2020-12-30', 15],
    ['something invalid', 30], // should be ignored
  ];
  series.handleData(apiData);
  expect(series.toPlainObject()).toEqual({
    data: [
      ['2020-12-15', 10],
      ['2020-12-30', 15],
      ['2021-01-02', 20],
    ],
  });
});

test('merge data simple case', () => {
  const seriesA = new TimeSeries();
  seriesA.handleData([
    ['2020-06-01', 10],
    ['2020-06-02', 20],
  ]);

  const seriesB = new TimeSeries();
  seriesB.handleData([
    ['2020-06-03', 30],
    ['2020-06-04', 40],
  ]);

  const merged = seriesA.mergeWith(seriesB);
  expect(merged.toPlainObject()).toEqual({
    data: [
      ['2020-06-01', 10],
      ['2020-06-02', 20],
      ['2020-06-03', 30],
      ['2020-06-04', 40],
    ],
  });
});

test('merge data with empty series', () => {
  const seriesA = new TimeSeries();
  seriesA.handleData([
    ['2020-06-01', 10],
    ['2020-06-02', 20],
  ]);

  const seriesB = new TimeSeries();

  const merged = seriesA.mergeWith(seriesB);
  expect(merged.toPlainObject()).toEqual({
    data: [
      ['2020-06-01', 10],
      ['2020-06-02', 20],
    ],
  });
});

test('merge data over lapping data', () => {
  const seriesA = new TimeSeries();
  seriesA.handleData([
    ['2020-06-01', 10],
    ['2020-06-02', 20],
    ['2020-06-03', 30],
    ['2020-06-04', 40],
  ]);

  const seriesB = new TimeSeries();
  seriesB.handleData([
    ['2020-06-02', 50],
    ['2020-06-03', 60],
  ]);

  const merged = seriesA.mergeWith(seriesB);
  expect(merged.toPlainObject()).toEqual({
    data: [
      ['2020-06-01', 10],
      ['2020-06-02', 50],
      ['2020-06-03', 60],
      ['2020-06-04', 40],
    ],
  });
});

test('get datapoint over sparse weekend', () => {
  const series = new TimeSeries();
  series.handleData([
    ['2020-06-01', 10],
    ['2020-06-02', 20],
    ['2020-06-05', 30],
    ['2020-06-06', 40],
  ]);

  expect(series.get(new Date('2020-05-31T00:00:00Z'))).toBe(10);
  expect(series.get(new Date('2020-06-01T00:00:00Z'))).toBe(10);
  expect(series.get(new Date('2020-06-02T00:00:00Z'))).toBe(20);
  expect(series.get(new Date('2020-06-04T00:00:00Z'))).toBe(20);
  expect(series.get(new Date('2020-06-05T00:00:00Z'))).toBe(30);
  expect(series.get(new Date('2020-06-06T00:00:00Z'))).toBe(40);
  expect(series.get(new Date('2020-06-07T00:00:00Z'))).toBe(40);
});

test('get datapoint from empty series', () => {
  const series = new TimeSeries();
  expect(series.get(new Date('2020-05-31T00:00:00Z'))).toBe(0);
});

test('get last endpoint', () => {
  const series = new TimeSeries();
  series.handleData([
    ['2020-06-01', 10],
    ['2020-06-02', 20],
    ['2020-06-05', 30],
  ]);
  expect(series.getLast()).toBe(30);
});

test('get last endpoint from empty series', () => {
  const series = new TimeSeries();
  expect(series.getLast()).toBe(0);
});

test('validate series to check for duplicated data points', () => {
  const validSeries = new TimeSeries();
  validSeries.handleData([
    ['2020-06-01', 10],
    ['2020-06-02', 20],
    ['2020-06-05', 30],
  ]);
  expect(validateSeries(validSeries.data)).toBeTruthy();

  const invalidSeries = new TimeSeries();
  invalidSeries.handleData([
    ['2020-06-01', 10],
    ['2020-06-02', 20],
    ['2020-06-02', 20],
  ]);
  expect(validateSeries(invalidSeries.data)).toBeFalsy();
});
