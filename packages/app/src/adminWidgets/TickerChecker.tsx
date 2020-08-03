import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { functions } from 'firebase/app';
import { RiSearchLine } from 'react-icons/ri';
import TextInput from 'components/TextInput';
import Button from 'components/Button';
import Type from 'components/Type';
import { Card } from 'commonStyledComponents';
import { theme } from 'theme';

const CodeBlock = styled.code`
  display: block;
  text-align: left;
`;

const Error = styled(Type)`
  color: ${theme.colors.error};
  margin-top: ${theme.spacings('s')};
`;

function TickerChecker() {
  const [ticker, setTicker] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  return (
    <Card
      as="form"
      onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const checkTicker = functions().httpsCallable('checkTicker');
        try {
          const checkResult = await checkTicker({ ticker });
          setResult(checkResult.data);
          setError('');
        } catch (err) {
          setError(err.message);
          setResult('');
        }
      }}
    >
      <Type scale="h4">Check stock ticker</Type>
      <TextInput
        label="Ticker Symbol"
        placeholder="E.g. AAPL"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        required
      />
      <Button
        startIcon={<RiSearchLine />}
        variant="shout"
        disabled={!ticker.trim()}
      >
        Check
      </Button>
      {result && (
        <pre>
          <CodeBlock>{result && JSON.stringify(result, null, 2)}</CodeBlock>
        </pre>
      )}
      {error && <Error scale="body2">{error}</Error>}
    </Card>
  );
}

export default TickerChecker;
