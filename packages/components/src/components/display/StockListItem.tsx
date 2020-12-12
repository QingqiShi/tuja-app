import styled from 'styled-components';
import Type from './Type';

const Name = styled.div`
  min-width: 100%;
  width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

function decodeHtml(html: string) {
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

interface StockListItemProps {
  code: string;
  exchange: string;
  name: string;
}

function StockListItem({ code, exchange, name }: StockListItemProps) {
  return (
    <div>
      <div>
        <Type scale="body1" noMargin as="span" weight={800}>
          {code}
        </Type>
        <Type scale="body1" noMargin as="span">
          {' '}
          · {exchange}
        </Type>
      </div>
      <Type scale="body2" noMargin as={Name}>
        {decodeHtml(name)}
      </Type>
    </div>
  );
}

export default StockListItem;
