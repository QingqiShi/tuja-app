import React, { useState } from 'react';
import styled from 'styled-components/macro';
import DateInput from 'components/DateInput';

const Container = styled.div`
  width: 300px;
`;

export default {
  title: 'Inputs|DateInput',
  component: DateInput,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Demo = () => {
  const [date, setDate] = useState(new Date());
  return <DateInput value={date} onChange={setDate} />;
};
