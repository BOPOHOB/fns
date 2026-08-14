import { useCallback, useRef } from "react";
import { useStorageState } from "../../utils/useStorageState";
import { useLatest } from "../../utils/useLatest";

type IntervalState = {
  interval: number | null,
  setInterval: (v: number | null) => void,
  speed: number | null,
  setSpeed: (v: number | null) => void,
  pause: number | null,
  setPause: (v: number | null) => void
}

const useSeriesController = (): IntervalState => {
  const [interval, setInterval] = useStorageState<number | null>(null, 'addResult.interval');
  const [speed, setSpeed] = useStorageState<number | null>(null, 'addResult.speed');
  const [pause, setPause] = useStorageState<number | null>(null, 'addResult.pause');
  const lastInput = useRef<'speed' | 'interval' | 'pause'>(null);
  const prevInput = useRef<'speed' | 'interval' | 'pause'>(null);
  const intervalRef = useLatest(interval);
  const speedRef = useLatest(speed);
  const pauseRef = useLatest(pause);

  const intervalHolder = useCallback((intervalValue: null | number) => {
    setInterval(intervalValue);
    if (lastInput.current !== 'interval') {
      prevInput.current = lastInput.current;
      lastInput.current = 'interval';
    }
    if (intervalValue === null) {
      return;
    }
    if (speedRef.current === null && pauseRef.current === null) {
      return;
    }
    if (speedRef.current === null) {
      if (intervalValue > pauseRef.current) {
        setSpeed(intervalValue - pauseRef.current);
      }
    } else if (pauseRef.current === null) {
      if (intervalValue > speedRef.current) {
        setPause(intervalValue - speedRef.current);
      }
    } else if (prevInput.current === 'pause') {
      if (intervalValue > pauseRef.current) {
        setSpeed(intervalValue - pauseRef.current);
      }
    } else if (prevInput.current === 'speed') {
      if (intervalValue > speedRef.current) {
        setPause(intervalValue - speedRef.current);
      }
    }
  }, []);
  const speedHolder = useCallback((speedValue: null | number) => {
    setSpeed(speedValue);
    if (lastInput.current !== 'speed') {
      prevInput.current = lastInput.current;
      lastInput.current = 'speed';
    }
    if (speedValue === null) {
      return;
    }
    if (intervalRef.current === null && pauseRef.current === null) {
      return;
    }
    if (intervalRef.current === null) {
      setInterval(speedValue + pauseRef.current);
    }
    if (pauseRef.current === null) {
      if (intervalRef.current > speedValue) {
        setPause(intervalRef.current - speedValue);
      }
    }
    if (prevInput.current === 'pause') {
      setInterval(speedValue + pauseRef.current);
    }
    if (prevInput.current === 'interval') {
      if (intervalRef.current > speedValue) {
        setPause(intervalRef.current - speedValue);
      }
    }
  }, []);
  const pauseHolder = useCallback((pauseValue: null | number) => {
    setPause(pauseValue);
    if (lastInput.current !== 'pause') {
      prevInput.current = lastInput.current;
      lastInput.current = 'pause';
    }
    if (pauseValue === null) {
      return;
    }
    if (speedRef.current === null && intervalRef.current === null) {
      return;
    }
    if (speedRef.current === null) {
      if (intervalRef.current > pauseValue) {
        setSpeed(intervalRef.current - pauseValue);
      }
    }
    if (intervalRef.current === null) {
      setInterval(speedRef.current + pauseValue);
    }
    if (prevInput.current === 'interval') {
      if (intervalRef.current > pauseValue) {
        setSpeed(intervalRef.current - pauseValue);
      }
    }
    if (prevInput.current === 'speed') {
      setInterval(speedRef.current + pauseValue);
    }
  }, []);
  return {
    interval,
    setInterval: intervalHolder,
    speed,
    setSpeed: speedHolder,
    pause,
    setPause: pauseHolder,
  };
};

export { useSeriesController };
