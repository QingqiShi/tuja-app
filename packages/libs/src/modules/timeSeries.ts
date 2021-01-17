import dayjs from 'dayjs';
import { bisector } from 'd3-array';

const bisectDate = bisector<[Date, number], Date>((d, x) => {
  const current = dayjs(d[0]);
  if (current.isBefore(x, 'date')) return -1;
  if (current.isSame(x, 'date')) return 0;
  return 1;
}).right;

export class TimeSeries {
  data: [Date, number][] = [];

  constructor(obj?: { data: [Date, number][] }) {
    if (obj?.data) {
      this.data = obj.data;
    }
  }

  toPlainObject() {
    return {
      data: this.data.map(
        ([date, val]) => [dayjs(date).format('YYYY-MM-DD'), val] as const
      ),
    };
  }

  handleData(data: [string, number][]) {
    this.data = [];

    data.forEach(([date, val]) => {
      const parsedDate = dayjs(date, 'YYYY-MM-DD', true);
      if (parsedDate.isValid()) {
        this.data.push([parsedDate.toDate(), val]);
      }
    });

    this.data.sort((a, b) => a[0].getTime() - b[0].getTime());
    return this;
  }

  mergeWith(series: TimeSeries) {
    const merged = new TimeSeries();

    if (!series.data.length) {
      merged.data = [...this.data];
      return merged;
    }

    // Assume both TimeSeries are dense, filter out the time range covered by series
    const seriesDateRange = {
      start: dayjs(series.data[0][0]),
      end: dayjs(series.data[series.data.length - 1][0]),
    };
    const filteredData = this.data.filter(
      (dataPoint) =>
        seriesDateRange.start.isAfter(dataPoint[0], 'day') ||
        seriesDateRange.end.isBefore(dataPoint[0], 'day')
    );

    merged.data = [...filteredData, ...series.data].sort(
      (a, b) => a[0].getTime() - b[0].getTime()
    );
    return merged;
  }

  get(date: Date) {
    if (!this.data.length) return 0;

    const index = bisectDate(this.data, date) - 1;
    if (index >= 0 && index < this.data.length) {
      return this.data[index][1];
    }

    // There's no scenario where index would be greater than data length
    // So here only the case where index < 0 is handled
    return this.data[0][1];
  }

  getLast() {
    if (!this.data.length) return 0;
    return this.data[this.data.length - 1][1];
  }
}

/**
 * Validate time series data by checking if there are duplicated entries
 */
export function validateSeries(series: [Date, number][]) {
  const dateSet = new Set();
  for (const [date] of series) {
    const time = date.getTime();
    if (dateSet.has(time)) {
      return false;
    }
    dateSet.add(time);
  }
  return true;
}
