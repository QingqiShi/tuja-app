import { render } from '@testing-library/react';
import AnalysisContainer from './AnalysisContainer';

test('render title, configuration and chart', () => {
  const { getByText } = render(
    <AnalysisContainer
      title="Test title"
      configuration={<div>test configuration</div>}
      chart={<div>test chart</div>}
    />
  );
  expect(getByText('Test title')).toBeInTheDocument();
  expect(getByText('test configuration')).toBeInTheDocument();
  expect(getByText('test chart')).toBeInTheDocument();
});
