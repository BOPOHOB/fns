import { Navigate, useParams } from 'react-router';
import { isDaySegment } from './dayOutline';
import { Day } from '../pages/day/day';
import { Swimmer } from '../pages/swimmer/swimmer';
import { AddResult } from '../pages/addResult/addResult';

const SegmentIndex = () => {
  const { segment } = useParams<{ segment: string }>();
  return isDaySegment(segment) ? <Day /> : <Swimmer />;
};

const SegmentAdd = () => {
  const { segment } = useParams<{ segment: string }>();
  if (isDaySegment(segment)) {
    return <Navigate to={`/${segment}`} replace />;
  }
  return <AddResult />;
};

export { SegmentIndex, SegmentAdd };
