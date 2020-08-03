import React, { useState } from 'react';
import { firestore } from 'firebase/app';
import styled from 'styled-components/macro';
import { RiUploadCloud2Line } from 'react-icons/ri';
import useTimeSeries from 'hooks/useTimeSeries';
import TextInput from 'components/TextInput';
import FileInput from 'components/FileInput';
import Button from 'components/Button';
import Type from 'components/Type';
import Chart from 'components/Chart';
import { Card } from 'commonStyledComponents';

const ChartContainer = styled.div`
  height: 300px;
`;

function HistoricDataUploader() {
  const [ticker, setTicker] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const series = useTimeSeries();

  const upload = () => {
    const db = firestore();
    return Promise.all(
      Object.keys(series.asDbObject).map(async (year) => {
        const docRef = db.doc(`stocks/${ticker}/history/${year}`);
        return docRef.set(series.asDbObject[year]);
      })
    );
  };

  return (
    <Card
      as="form"
      onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await upload();
        setTicker('');
        setFile(null);
        series.handleCsvFile(null);
      }}
    >
      <Type scale="h4">Upload Historic Data</Type>
      <TextInput
        label="Ticker Symbol"
        placeholder="E.g. AAPL"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        required
      />
      <FileInput
        label="Historic data"
        helperText="Only accepts .csv files"
        accept=".csv"
        file={file}
        onFile={(file) => {
          setFile(file);
          series.handleCsvFile(file);
        }}
      />
      {!!series.asChartData.length && (
        <ChartContainer>
          <Chart data={series.asChartData} />
        </ChartContainer>
      )}
      <Button
        startIcon={<RiUploadCloud2Line />}
        variant="shout"
        disabled={!series.asChartData.length || !ticker}
      >
        Upload
      </Button>
    </Card>
  );
}

export default HistoricDataUploader;
