import { render } from '../../testUtils';
import Modal from './Modal';

test('render toggle open', () => {
  const { getByText, queryByText, rerender } = render(
    <Modal>
      <div>test</div>
    </Modal>
  );
  expect(queryByText('test')).toBeNull();
  rerender(
    <Modal open>
      <div>test</div>
    </Modal>
  );
  expect(getByText('test')).toBeInTheDocument();
});

test('max width max width', () => {
  const { getByText } = render(
    <Modal open minWidth={10} maxWidth={15}>
      test
    </Modal>
  );
  expect(getByText('test')).toHaveStyle(`
    max-width: 15rem;
    min-width: min(10rem,100%);
  `);
});
