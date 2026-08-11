import { useState, type FC } from 'react';
import { Button, Select } from 'antd';
import { CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { DAY_LABELS, formatSlot, sortSlots } from '../../shared/slots';

import cn from './slotsEditor.module.less';

const DAY_OPTIONS = (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((value) => ({
  value,
  label: DAY_LABELS[value],
}));

const HOUR_OPTIONS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((h) => ({
  value: h,
  label: String(h).padStart(2, '0'),
}));

const MINUTE_OPTIONS = [0, 15, 30, 45].map((m) => ({
  value: m,
  label: String(m).padStart(2, '0'),
}));

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function buildSlot(day: string, hour: number, minute: number, durationMinutes: number): string {
  const startTotal = hour * 60 + minute;
  const endTotal = startTotal + durationMinutes;
  const endHour = Math.floor(endTotal / 60) % 24;
  const endMinute = endTotal % 60;
  return `${day} ${pad(hour)}:${pad(minute)}-${pad(endHour)}:${pad(endMinute)}`;
}

const SlotsEditor: FC<{
  value: string[];
  onChange: (slots: string[]) => void;
}> = ({ value, onChange }) => {
  const [day, setDay] = useState<string | null>('mon');
  const [hour, setHour] = useState<number | null>(7);
  const [minute, setMinute] = useState(0);

  const canAdd = day !== null && hour !== null;

  const addSlot = (durationMinutes: number) => {
    if (day === null || hour === null) return;
    const slot = buildSlot(day, hour, minute, durationMinutes);
    if (value.includes(slot)) return;
    onChange(sortSlots([...value, slot]));
    setDay('mon');
    setHour(7);
    setMinute(0);
  };

  const removeSlot = (index: number) => {
    const next = [...value];
    next.splice(index, 1);
    onChange(next);
  };

  return (
    <div className={cn.root}>
      <ul className={cn.layout}>
        {value.map((slot, index) => (
          <li key={slot}>
            <span>{formatSlot(slot)}</span>
            <Button
              size="small"
              icon={<CloseCircleOutlined />}
              variant="text"
              onClick={() => removeSlot(index)}
            />
          </li>
        ))}
        <li className={cn.editors}>
          <Select
            className={cn.day}
            placeholder="День"
            value={day ?? undefined}
            onChange={(v) => setDay(v ?? null)}
            options={DAY_OPTIONS}
          />
          <Select
            className={cn.hour}
            placeholder="Часы"
            value={hour ?? undefined}
            onChange={(v) => setHour(v ?? null)}
            options={HOUR_OPTIONS}
          />
          :
          <Select
            className={cn.minute}
            value={minute}
            onChange={setMinute}
            options={MINUTE_OPTIONS}
          />
          <Button disabled={!canAdd} onClick={() => addSlot(45)}>
            45мин
          </Button>
          <Button disabled={!canAdd} onClick={() => addSlot(90)}>
            90мин
          </Button>
        </li>
      </ul>
    </div>
  );
};

export { SlotsEditor };
