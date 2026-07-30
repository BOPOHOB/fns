import { Input } from "antd";
import { useState, type FC } from "react";
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

const ResultInput: FC<{ className?: string, value: number | null, onChange: ((v: number | null) => void) }> = ({ className, value, onChange }) => {
  const [input, setInput] = useState(stringifySeconds(value));
  const status = isValidTimeInput(input) || input === '' ? undefined : 'warning';

  return (
    <Input
      className={className}
      status={status}
      onChange={(e) => { setInput(e.target.value); onChange(parseTimeInput(e.target.value)); }}
      placeholder="hh:mm:ss.ss"
      value={input}
    />
  );
}

export { ResultInput }
