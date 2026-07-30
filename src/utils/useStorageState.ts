import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import dayjs from 'dayjs';

const DAYJS_TAG = '__dayjs__';

type DayjsEncoded = { [DAYJS_TAG]: string };

function isDayjsEncoded(value: unknown): value is DayjsEncoded {
  return (
    !!value &&
    typeof value === 'object' &&
    DAYJS_TAG in value &&
    typeof (value as DayjsEncoded)[DAYJS_TAG] === 'string' &&
    Object.keys(value).length === 1
  );
}

function encode(value: unknown): unknown {
  if (dayjs.isDayjs(value)) {
    return { [DAYJS_TAG]: value.toISOString() } satisfies DayjsEncoded;
  }
  if (Array.isArray(value)) {
    return value.map(encode);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, encode(entry)]),
    );
  }
  return value;
}

function decode(value: unknown): unknown {
  if (isDayjsEncoded(value)) {
    return dayjs(value[DAYJS_TAG]);
  }
  if (Array.isArray(value)) {
    return value.map(decode);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, decode(entry)]),
    );
  }
  return value;
}

function useStorageState<S>(
  initialValue: S | (() => S),
  storageKey: string,
): [S, Dispatch<SetStateAction<S>>] {
  const [value, setValue] = useState<S>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        return decode(JSON.parse(stored)) as S;
      }
    } catch {
      // битый JSON — падаем на initialValue
    }

    return typeof initialValue === 'function'
      ? (initialValue as () => S)()
      : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(encode(value)));
  }, [storageKey, value]);

  return [value, setValue];
}

export { useStorageState };
