import { createContext, useContext } from 'react';
import { Outlet, useParams } from 'react-router';

const DAY_SEGMENT_RE = /^\d{4}-\d{2}-\d{2}$/;

function isDaySegment(value: string | undefined): value is string {
  return value !== undefined && DAY_SEGMENT_RE.test(value);
}

const DAY_CONTEXT = createContext<string | null>(null);

const useDay = () => {
  const ctx = useContext(DAY_CONTEXT);
  if (!ctx) throw new Error('useDay must be used inside day route');
  return ctx;
};

const DayOutline = () => {
  const { segment } = useParams<{ segment: string }>();

  if (!isDaySegment(segment)) {
    return null;
  }

  return (
    <DAY_CONTEXT.Provider value={segment}>
      <Outlet />
    </DAY_CONTEXT.Provider>
  );
};

export { DayOutline, useDay, isDaySegment };
