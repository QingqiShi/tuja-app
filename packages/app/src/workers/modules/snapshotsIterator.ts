import dayjs from 'dayjs';
import type { Snapshot } from '@tuja/libs';

export const iterateSnapshots = (options: {
  snapshots: Snapshot[];
  startDate: Date;
  endDate: Date;
  onDate: (
    date: Date,
    snapshot: Snapshot,
    prevSnapshot: Snapshot | null
  ) => void;
}) => {
  const { snapshots, startDate, endDate, onDate } = options;
  const startDay = dayjs(startDate);
  const endDay = dayjs(endDate);

  snapshots.forEach((snapshot, i) => {
    const nextSnapshot = snapshots[i + 1];

    const loopStartDate = dayjs.max([dayjs(snapshot.date), startDay]);
    const loopEndDate = nextSnapshot
      ? dayjs.min([dayjs(nextSnapshot.date).subtract(1, 'day'), endDay])
      : endDay;

    for (
      let day = loopStartDate;
      day.isSameOrBefore(loopEndDate, 'date');
      day = day.add(1, 'day')
    ) {
      onDate(day.toDate(), snapshot, i > 0 ? snapshots[i - 1] : null);
    }
  });
};
