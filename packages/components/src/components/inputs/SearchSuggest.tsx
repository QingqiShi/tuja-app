import { useState } from 'react';
import { useDebounce } from 'react-use';
import { RiSearchLine } from 'react-icons/ri';
import styled, { css } from 'styled-components';
import { transparentize } from 'polished';
import { border, paddings } from '../../mixins';
import TextInput from './TextInput';
import LinearLoader from '../feedback/LinearLoader';

const SuggestionsContainer = styled.div<{ maxHeight?: number }>`
  ${border}
  margin-top: ${({ theme }) => theme.spacings.xs};
  margin-bottom: ${({ theme }) => theme.spacings.s};
  background-color: ${({ theme }) => theme.colors.backgroundMain};
  position: relative;
  padding: ${({ theme }) => theme.spacings.xs};

  ${({ maxHeight }) =>
    maxHeight &&
    css`
      max-height: ${maxHeight}rem;
      overflow: auto;
    `}
`;

const SuggestionItem = styled.div<{ reactHover?: boolean }>`
  ${paddings}
  border-radius: ${({ theme }) => theme.spacings.xs};

  ${({ reactHover, theme }) =>
    reactHover &&
    css`
      &:hover {
        cursor: pointer;
        background-color: ${transparentize(0.9, theme.colors.textOnBackground)};
      }
    `}
`;

interface SearchSuggestProps {
  onSearch: (query: string) => Promise<void>;
  onClick?: (index: number) => void;
  suggestions: React.ReactNode[];
  maxSuggestHeight?: number;
}

function SearchSuggest({
  onSearch,
  onClick,
  suggestions = [],
  maxSuggestHeight,
}: SearchSuggestProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  useDebounce(
    async () => {
      setIsLoading(true);
      await onSearch(query);
      setIsLoading(false);
    },
    300,
    [query]
  );

  return (
    <div>
      <TextInput
        placeholder="Search"
        leadIcon={<RiSearchLine size="100%" />}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {!!suggestions.length && (
        <SuggestionsContainer maxHeight={maxSuggestHeight}>
          {isLoading && <LinearLoader />}
          {suggestions.map((suggestion, i) => (
            <SuggestionItem
              key={`suggestion-${i}`}
              reactHover={!!onClick}
              onClick={onClick && (() => onClick(i))}
            >
              {suggestion}
            </SuggestionItem>
          ))}
        </SuggestionsContainer>
      )}
    </div>
  );
}

export default SearchSuggest;
