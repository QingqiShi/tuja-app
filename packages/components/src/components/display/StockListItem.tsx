import styled from 'styled-components';
import Type from './Type';
import { v } from '../../theme';

const Name = styled.div`
  min-width: 100%;
  width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 0.9rem;
  color: ${v.textSecondary};
`;

const Ticker = styled.span`
  font-weight: ${v.fontBold};
`;

const Seperator = styled.span`
  margin: 0 ${v.spacerXS};
`;

function decodeHtml(html: string) {
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

interface StockListItemProps {
  code: string;
  exchange?: string;
  name: string;
}

function StockListItem({ code, exchange, name }: StockListItemProps) {
  return (
    <div>
      <div>
        <Ticker>{code}</Ticker>
        {exchange && (
          <>
            <Seperator>·</Seperator>
            <span>{exchange}</span>
          </>
        )}
      </div>
      <Name>{decodeHtml(name)}</Name>
    </div>
  );
}

export default StockListItem;
