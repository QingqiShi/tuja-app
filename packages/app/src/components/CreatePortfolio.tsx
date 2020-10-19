import React, { useState } from 'react';
import styled from 'styled-components/macro';
import { RiBriefcaseLine, RiAddLine } from 'react-icons/ri';
import { Button } from '@tuja/components';
import { Center } from 'commonStyledComponents';
import Type from 'components/Type';
import Select from 'components/Select';
import TextInput from 'components/TextInput';
import { theme } from 'theme';

const LargeIcon = styled.div`
  display: block;
  font-size: 3rem;
`;

const CreateContainer = styled.div`
  height: 80vh;
  width: 80vw;
  max-width: 300px;
  margin: 0 auto;

  @media (${theme.breakpoints.minTablet}) {
    max-width: 400px;
  }

  @media (${theme.breakpoints.minLaptop}) {
    max-width: 450px;
  }

  h4 {
    margin-top: 0.2em;
  }

  > div {
    padding: ${theme.spacings('m')};
  }
`;

interface CreatePortfolioProps {
  onCreate?: (name: string, currency: string) => void;
}

function CreatePortfolio({ onCreate }: CreatePortfolioProps) {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('GBP');
  return (
    <CreateContainer>
      <Center>
        <LargeIcon>
          <RiBriefcaseLine />
        </LargeIcon>
        <Type scale="h4">Create Portfolio</Type>
        <TextInput
          label="Name"
          placeholder="My Investments"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Select
          label="Currency"
          options={[
            { label: 'GBP (£)', value: 'GBP' },
            { label: 'USD ($)', value: 'USD' },
          ]}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          required
        />
        <Button
          variant="shout"
          startIcon={<RiAddLine />}
          disabled={!name || !currency}
          onClick={() => onCreate && onCreate(name, currency)}
        >
          Create
        </Button>
      </Center>
    </CreateContainer>
  );
}

export default CreatePortfolio;
