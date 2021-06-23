import { fireEvent, act } from '@testing-library/react';
import { render } from '../../testUtils';
import SearchSuggest from './SearchSuggest';

jest.useFakeTimers();

test('fire search callback', async () => {
  const handleSearch = jest.fn(async () => {});
  const { getByPlaceholderText } = render(
    <SearchSuggest onSearch={handleSearch} suggestions={[]} />
  );
  fireEvent.change(getByPlaceholderText('Search'), {
    target: { value: 'test' },
  });
  await act(async () => {
    jest.runAllTimers();
  });
  expect(handleSearch).toHaveBeenCalledWith('test');
});

test('render suggestions', async () => {
  const handleClick = jest.fn();
  const { getByText } = render(
    <SearchSuggest
      onSearch={async () => {}}
      onClick={handleClick}
      suggestions={[<div>a</div>, <div>b</div>]}
    />
  );
  expect(getByText('a')).toBeInTheDocument();
  expect(getByText('b')).toBeInTheDocument();

  fireEvent.click(getByText('b'));
  expect(handleClick).toHaveBeenCalledWith(1);
});

test('debounce search calls', async () => {
  const handleSearch = jest.fn(async () => {});
  const { getByPlaceholderText } = render(
    <SearchSuggest onSearch={handleSearch} suggestions={[]} />
  );
  fireEvent.change(getByPlaceholderText('Search'), {
    target: { value: 'testA' },
  });
  fireEvent.change(getByPlaceholderText('Search'), {
    target: { value: 'testB' },
  });
  await act(async () => {
    jest.runAllTimers();
  });
  expect(handleSearch).toHaveBeenCalledWith('testB');
});
