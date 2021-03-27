import { useMemo } from 'react';
import styled from 'styled-components';
import dayjs from 'dayjs';
import { v } from '../../theme';
import ButtonBase from './ButtonBase';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
  @media (${v.minLaptop}) {
    display: inline-flex;
  }
`;

const Item = styled(ButtonBase)`
  color: ${v.textSecondary};
  padding: ${v.spacerXS} ${v.spacerXS};

  @media (${v.minLaptop}) {
    padding: ${v.spacerXS} ${v.spacerS};
    &:not(:last-child) {
      margin-right: ${v.spacerS};
    }
  }

  &:disabled,
  &:disabled:hover,
  &[disabled],
  &[disabled]:hover {
    color: ${v.textMain};
    opacity: 1;
    position: relative;

    &:after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      left: 0.5rem;
      right: 0.5rem;
      height: 0.2rem;
      background-color: ${v.accentMain};
      border-radius: 1rem;
    }
  }
`;

const defaultPeriods = [
  { label: '1M', val: 1, unit: 'month' as const },
  { label: '3M', val: 3, unit: 'month' as const },
  { label: '6M', val: 6, unit: 'month' as const },
  { label: '1Y', val: 1, unit: 'year' as const },
  { label: '5Y', val: 5, unit: 'year' as const },
];

interface DateRangeTabsProps {
  maxDate?: Date;
  value?: Date;
  onChange?: (date: Date) => void;
}

function DateRangeTabs({ maxDate, value, onChange }: DateRangeTabsProps) {
  const periods = useMemo(() => {
    const start = maxDate && dayjs(dayjs(maxDate).format('YYYY-MM-DD'));
    const currentDate = dayjs(dayjs().format('YYYY-MM-DD'));
    const result: { label: string; date: Date }[] = [];

    for (let i = 0; i < defaultPeriods.length; i++) {
      const { label, val, unit } = defaultPeriods[i];
      const date = currentDate.subtract(val, unit);
      if (!date.isAfter(start ?? currentDate)) {
        break;
      }
      result.push({ label, date: date.toDate() });
    }
    result.push({
      label: 'Max',
      date: start?.toDate() ?? currentDate.toDate(),
    });

    return result;
  }, [maxDate]);

  return (
    <Container>
      {periods.map(({ label, date }) => (
        <Item
          key={`period-${label}`}
          disabled={dayjs(value).isSame(date, 'day')}
          onClick={() => onChange && onChange(date)}
        >
          {label}
        </Item>
      ))}
    </Container>
  );
}

export default DateRangeTabs;
