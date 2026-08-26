import { Input, type InputProps } from "antd";
import { useEffect, useRef, useState, type FC } from "react";
import { stringifySeconds } from "../../utils/stringifySeconds";

function parseTimeInput(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(':').map(v => parseFloat(v));
  if (parts.find(v => !isFinite(v)) !== undefined) {
    return null;
  }
  if (parts.slice(1).find(v => v > 60) !== undefined) {
    return null;
  }
  try {
    let result = 0;
    for (const part of parts) {
      const addition = part;
      result *= 60;
      result += addition;
    }
    return result
  } catch {
    return null;
  }
}

function isValidTimeInput(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  const val = parseTimeInput(trimmed);
  return val !== null && val > 0;
}

const TimeInput: FC<Omit<InputProps, 'value' | 'onChange' | 'status'> & { autoMinute?: 0 | 1 | 2; value: number | null, onChange: ((v: number | null) => void) }> = 
({ value, onChange, autoMinute = 0, ...spread }) => {
  const [input, setInput] = useState(stringifySeconds(value));
  const status: InputProps['status'] = isValidTimeInput(input) || input === '' ? (value < 0 ? 'error' : undefined) : 'warning';

  const ref = useRef(null);

  useEffect(() => {
    if (document.activeElement !== ref.current.nativeElement) {
      setInput(stringifySeconds(value));
    }
  }, [value]);

  return (
    <Input
      ref={ref}
      onFocus={(e) => {
        if (autoMinute !== 0 && input === '') {
          setInput(`${autoMinute}:`);
          e.target.setSelectionRange(2, 2);
        }
        spread.onFocus?.(e);
      }}
      status={status}
      onChange={(e) => { setInput(e.target.value); onChange(parseTimeInput(e.target.value)); }}
      value={input}
      {...spread}
    />
  );
}

export { TimeInput }
