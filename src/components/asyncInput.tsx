import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FC,
} from "react";
import { Input, type InputProps } from "antd";
import { useLatest } from "../utils/useLatest";

type AsyncInputProps = Omit<
  InputProps,
  "value" | "onChange" | "disabled" | "addonAfter"
> & {
  value: string;
  /** Вызывается при сохранении (debounce / blur). Promise → инпут дизейблится. */
  onChange?: (value: string) => void | Promise<unknown>;
  disabled?: boolean;
  debounceMs?: number;
  /** Постфикс, пока значение изменено, но ещё не отправлено. */
  changedLabel?: string;
};

const AsyncInput: FC<AsyncInputProps> = memo(
  ({
    value,
    onChange,
    disabled,
    debounceMs = 0,
    changedLabel = "изменено",
    onBlur,
    ...props
  }) => {
    const [draft, setDraft] = useState(value);
    const [isLoading, setLoading] = useState(false);
    const draftRef = useLatest(draft);
    const valueRef = useLatest(value);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
      setDraft(value);
    }, [value]);

    const clearTimer = useCallback(() => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const commit = useCallback(async () => {
      clearTimer();
      const trimmed = draftRef.current.trim();
      if (!trimmed || trimmed === valueRef.current) {
        setDraft(valueRef.current);
        return;
      }
      if (onChange === undefined) return;

      const result = onChange(trimmed);
      if (result instanceof Promise) {
        setLoading(true);
        try {
          await result;
        } finally {
          setLoading(false);
        }
      }
    }, [clearTimer, onChange]);

    const scheduleCommit = useCallback(() => {
      clearTimer();
      if (debounceMs <= 0) {
        void commit();
        return;
      }
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        void commit();
      }, debounceMs);
    }, [clearTimer, commit, debounceMs]);

    useEffect(() => () => clearTimer(), [clearTimer]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setDraft(next);
      if (next.trim() && next.trim() !== valueRef.current) {
        scheduleCommit();
      } else {
        clearTimer();
      }
    };

    return (
      <Input
        {...props}
        value={draft}
        onChange={handleChange}
        disabled={Boolean(disabled) || isLoading}
        onBlur={(e) => {
          void commit();
          onBlur?.(e);
        }}
      />
    );
  },
);

export { AsyncInput };
