import styled from 'styled-components';
import { v } from '../../theme';

const Primary = styled.div`
  min-width: 100%;
  width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const Secondary = styled.div`
  font-size: 0.9rem;
  color: ${v.textSecondary};
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
  name: string;
  code: string;
  exchange?: string;
}

function StockListItem({ name, code, exchange }: StockListItemProps) {
  const decodedName = decodeHtml(name);
  return (
    <div>
      <Primary title={decodedName}>{decodedName}</Primary>
      <Secondary>
        <span>{code}</span>
        {exchange && (
          <>
            <Seperator>·</Seperator>
            <span>{exchange}</span>
          </>
        )}
      </Secondary>
    </div>
  );
}

export default StockListItem;
