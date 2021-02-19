import ReactDOM from 'react-dom';

jest.mock('react-dom', () => ({ render: jest.fn() }));

test('renders without crashing', () => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
  require('./index');
  expect(ReactDOM.render).toHaveBeenCalled();
});
