import { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'react-use';
import { RiDeleteBinLine } from 'react-icons/ri';
import styled from 'styled-components';
import {
  ButtonPrimary,
  ButtonSecondary,
  ButtonTertiary,
  TextInput,
} from '@tuja/components';
import { ActionsContainer, Card, CardMedia } from '../commonStyledComponents';
import { fetchStockSearch } from '../libs/apiClient';

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
  const cancelRef = useRef(() => {});
  useEffect(() => {
    const fetch = async () => {
      if (cancelRef.current) cancelRef.current();

      const fetchStockSearchController = fetchStockSearch(debouncedSearchQuery);
      cancelRef.current = fetchStockSearchController.cancel;
      try {
        const data = await fetchStockSearchController.fetch();
        setSearchSuggestions(data);
      } catch (e) {
        if (e.name !== 'AbortError') {
          throw e;
        }
      }
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
        <ButtonPrimary disabled={loading} type="submit">
          Set Benchmark
        </ButtonPrimary>
        {defaultBenchmark && onDelete && (
          <ButtonSecondary
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
          >
            <RiDeleteBinLine />
          </ButtonSecondary>
        )}
        <ButtonTertiary onClick={onClose}>Cancel</ButtonTertiary>
      </ActionsContainer>
    </form>
  );
}

export default SetBenchmarkForm;
