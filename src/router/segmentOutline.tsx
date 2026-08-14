import { useParams } from 'react-router';
import { DayOutline, isDaySegment } from './dayOutline';
import { SwimmerOutline } from './swimmerOutline';

/** Первый сегмент пути: YYYY-MM-DD → день, иначе → пловец. */
const SegmentOutline = () => {
  const { segment } = useParams<{ segment: string }>();
  return isDaySegment(segment) ? <DayOutline /> : <SwimmerOutline />;
};

export { SegmentOutline };
