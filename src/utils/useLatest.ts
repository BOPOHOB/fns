import { useRef } from "react";

const useLatest = <T>(v: T) => {
  const latest = useRef<T>(v);
  latest.current = v;
  return latest;
};

export { useLatest };
