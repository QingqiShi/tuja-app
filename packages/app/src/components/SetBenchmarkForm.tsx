import React, { useState, useEffect } from 'react';
import { useDebounce } from 'react-use';
import { RiDeleteBinLine } from 'react-icons/ri';
import firebase from 'firebase/app';
import styled from 'styled-components/macro';
import { Button, TextInput } from '@tuja/components';
import { ActionsContainer, Card, CardMedia } from 'commonStyledComponents';

const SearchContainer = styled.div`
  position: relative;
`;

const SearchSuggestions = styled(Card)`
  position: absolute;
  top: 5rem;
  width: 100%;
  max-height: 10rem;
  overflow: auto;
  z-index: 10;

  button {
    margin: 0;
  }
`;

const SearchSuggestionItem = styled.button`
  cursor: pointer;
  background: transparent;
  text-align: left;
  border: none;
  font-family: ${({ theme }) => theme.fontFamily};
  font-size: ${({ theme }) => theme.fonts.cta.size};
  line-height: ${({ theme }) => theme.fonts.cta.height};
  letter-spacing: ${({ theme }) => theme.fonts.cta.spacing};
  color: ${({ theme }) => theme.colors.textOnBackground};
  padding: ${({ theme }) => theme.spacings.s};

  &:hover {
    background-color: ${({ theme }) => theme.colors.callToAction};
    color: ${({ theme }) => theme.colors.textOnCallToAction};
  }
`;

interface SetBenchmarkFormProps {
  defaultBenchmark?: string;
  onSubmit?: (benchmark: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose?: () => void;
}

function SetBenchmarkForm({
  defaultBenchmark,
  onClose,
  onSubmit,
  onDelete,
}: SetBenchmarkFormProps) {
  const [benchmark, setBenchmark] = useState(defaultBenchmark ?? '');

  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState(defaultBenchmark ?? '');
  const [searchFocused, setSearchFocused] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  useDebounce(
    () => {
      setDebouncedSearchQuery(searchQuery);
    },
    500,
    [searchQuery]
  );

  const [searchSuggestions, setSearchSuggestions] = useState<
    { Code: string; Exchange: string; Name: string }[]
  >([]);
  useEffect(() => {
    const fetch = async () => {
      const searchStocks = firebase.functions().httpsCallable('searchStocks');
      const result = await searchStocks({ query: debouncedSearchQuery });
      setSearchSuggestions(result.data);
    };

    if (debouncedSearchQuery) {
      fetch();
    } else {
      setSearchSuggestions([]);
    }
  }, [debouncedSearchQuery]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          if (onSubmit) {
            await onSubmit(benchmark);
          }
          setLoading(false);
          if (onClose) {
            onClose();
          }
        } catch {
          setLoading(false);
        }
      }}
    >
      <SearchContainer>
        <TextInput
          label="Search for a symbol"
          placeholder="e.g. AAPL"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
        />
        {searchFocused && !!searchSuggestions.length && (
          <SearchSuggestions>
            <CardMedia>
              {searchSuggestions.map((suggestion) => (
                <SearchSuggestionItem
                  key={`${suggestion.Code}.${suggestion.Exchange}`}
                  onClick={() => {
                    setBenchmark(`${suggestion.Code}.${suggestion.Exchange}`);
                    setSearchFocused(false);
                    setSearchQuery(`${suggestion.Code}.${suggestion.Exchange}`);
                  }}
                  type="button"
                >
                  <span>
                    {suggestion.Code}.{suggestion.Exchange}
                  </span>
                  <span> - </span>
                  <span>{suggestion.Name}</span>
                </SearchSuggestionItem>
              ))}
            </CardMedia>
          </SearchSuggestions>
        )}
      </SearchContainer>

      <ActionsContainer>
        <Button variant="shout" disabled={loading} type="submit">
          Set Benchmark
        </Button>
        {defaultBenchmark && onDelete && (
          <Button
            type="button"
            variant="primary"
            icon={<RiDeleteBinLine />}
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await onDelete();
                setLoading(false);
                if (onClose) {
                  onClose();
                }
              } catch {
                setLoading(false);
              }
            }}
          />
        )}
        <Button type="button" onClick={onClose}>
          Cancel
        </Button>
      </ActionsContainer>
    </form>
  );
}

export default SetBenchmarkForm;
