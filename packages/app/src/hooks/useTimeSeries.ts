import { useState, useCallback, useMemo } from 'react';

export interface HistoricData {
  [year: string]: { [date: string]: number };
}

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

function useTimeSeries() {
  const [data, setData] = useState<[Date, number][]>([]);

  const handleCsvFile = useCallback(async (file: File | null) => {
    if (!file) {
      setData([]);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener('load', (e) => {
      if (typeof e.target?.result === 'string') {
        setData(parseCsvData(e.target.result));
      }
    });

    reader.readAsText(file);
  }, []);

  const handleDbData = useCallback(async (data: { [date: string]: number }) => {
    let result = [] as [Date, number][];
    Object.keys(data).forEach((date) => {
      result.push([new Date(date), data[date]]);
    });

    result = [...result].sort((a, b) => a[0].getTime() - b[0].getTime());
    setData(result);
  }, []);

  const asDbObject = useMemo(() => {
    const result: {
      [year: string]: { [date: string]: number };
    } = {};

    data.forEach(([date, val]) => {
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
  }, [data]);

  return {
    handleCsvFile,
    handleDbData,
    asDbObject,
    asChartData: data,
  };
}

export default useTimeSeries;
