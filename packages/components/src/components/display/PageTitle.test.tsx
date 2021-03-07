import { render, fireEvent } from '@testing-library/react';
import PageTitle from './PageTitle';

test('render title', () => {
  const { getByText } = render(<PageTitle>test title</PageTitle>);
  expect(getByText('test title')).toBeInTheDocument();
});

test('render back button', () => {
  const handleBack = jest.fn();
  const { getByText } = render(
    <PageTitle
      backButtonLabel="back label"
      backHref="/back"
      onBack={handleBack}
    >
      test title
    </PageTitle>
  );

  expect(getByText('back label')).toHaveAttribute('href', '/back');

  fireEvent.click(getByText('back label'));

  expect(handleBack).toHaveBeenCalled();
  expect(handleBack.mock.calls[0][0].defaultPrevented).toBeTruthy();
});
