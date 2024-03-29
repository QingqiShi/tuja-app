import { useState } from 'react';
import styled from 'styled-components';
import { RiBriefcaseLine, RiAddLine } from 'react-icons/ri';
import { ButtonPrimary, Select, TextInput, Type, v } from '@tuja/components';
import { Center } from '../commonStyledComponents';

const LargeIcon = styled.div`
  display: block;
  font-size: 3rem;
`;

const CreateContainer = styled.div`
  height: 80vh;
  width: 80vw;
  max-width: 300px;
  margin: 0 auto;

  @media (${v.minTablet}) {
    max-width: 400px;
  }

  @media (${v.minLaptop}) {
    max-width: 450px;
  }

  h4 {
    margin-top: 0.2em;
  }

  > div {
    padding: ${v.spacerM};
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
        <ButtonPrimary
          disabled={!name || !currency}
          onClick={() => onCreate && onCreate(name, currency)}
        >
          <RiAddLine />
          <span>Create</span>
        </ButtonPrimary>
      </Center>
    </CreateContainer>
  );
}

export default CreatePortfolio;
