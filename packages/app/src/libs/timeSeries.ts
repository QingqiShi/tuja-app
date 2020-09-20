import dayjs from 'dayjs';
import { bisector } from 'd3-array';

const bisectDate = bisector<[Date, number], Date>((d, x) => {
  const current = dayjs(d[0]);
  if (current.isBefore(x, 'date')) return -1;
  if (current.isSame(x, 'date')) return 0;
  return 1;
}).right;

class TimeSeries {
  data: [Date, number][] = [];

  constructor(obj?: { data: [Date, number][] }) {
    if (obj?.data) {
      this.data = obj.data;
    }
  }

  handleData(data: [string, number][]) {
    this.data = [];

    data.forEach(([date, val]) => {
      const parsedDate = dayjs(date, 'YYYY-MM-DD');
      if (parsedDate.isValid()) {
        this.data.push([parsedDate.toDate(), val]);
      }
    });

    this.data = [...this.data].sort((a, b) => a[0].getTime() - b[0].getTime());
  }

  mergeWith(series: TimeSeries) {
    const merged = new TimeSeries();
    merged.data = [...this.data, ...series.data].sort(
      (a, b) => a[0].getTime() - b[0].getTime()
    );
    return merged;
  }

  get(date: Date) {
    if (!this.data.length) return 0;

    const index = bisectDate(this.data, date) - 1;
    if (index >= 0 && index < this.data.length) {
      return this.data[index][1];
    } else if (index >= this.data.length) {
      return this.data[this.data.length - 1][1];
    }
    return this.data[0][1];
  }
}

export default TimeSeries;
