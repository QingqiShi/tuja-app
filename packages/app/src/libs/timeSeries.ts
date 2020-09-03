import dayjs from 'dayjs';
import { bisector } from 'd3-array';

const parseCsvData = (csvText: string) => {
  const lines = csvText.split('\n');
  const cells = lines.map((line) => line.split(','));

  if (cells.length < 1 || cells[0].length < 1) {
    return [];
  }

  const dateIndex = cells[0].indexOf('Date');
  const closeIndex = cells[0].indexOf('Close');

  let result: [Date, number][] = [];
  cells.forEach((row, i) => {
    if (i === 0) return;
    const date = new Date(row[dateIndex]);
    const close = parseFloat(row[closeIndex]);
    if (close) {
      result.push([date, close]);
    }
  });
  result = [...result].sort((a, b) => a[0].getTime() - b[0].getTime());

  return result;
};

const bisectDate = bisector<[Date, number], Date>((d, x) => {
  const current = dayjs(d[0]);
  if (current.isBefore(x, 'date')) return -1;
  if (current.isSame(x, 'date')) return 0;
  return 1;
}).right;

class TimeSeries {
  data: [Date, number][] = [];

  async handleCsvFile(file: File | null) {
    if (!file) {
      this.data = [];
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
      if (typeof e.target?.result === 'string') {
        this.data = parseCsvData(e.target.result);
      }
    });

    reader.readAsText(file);
  }

  async handleDbData(data: { [date: string]: number }, from?: Date, to?: Date) {
    this.data = [];
    Object.keys(data).forEach((date) => {
      this.data.push([new Date(date), data[date]]);
    });

    this.data = [...this.data].sort((a, b) => a[0].getTime() - b[0].getTime());
  }

  aggregateYear() {
    const result: {
      [year: string]: { [date: string]: number };
    } = {};

    this.data.forEach(([date, val]) => {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const dateKey = `${year}-${month < 10 ? `0${month}` : month}-${
        day < 10 ? `0${day}` : day
      }`;
      const dateYear = date.getFullYear();
      result[dateYear] = { ...result[dateYear], [dateKey]: val };
    });

    return result;
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

  getIndex(date: Date) {
    if (!this.data.length) return 0;

    return bisectDate(this.data, date) - 1;
  }
}

export default TimeSeries;
