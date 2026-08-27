
import { Radio, Tooltip } from 'antd';
import type { Stroke } from '../../../types/result';
import {
  BackstrokeIcon,
  BreaststrokeIcon,
  ButterflyIcon,
  FreestyleIcon,
  MedleyIcon,
} from './icons';
import { useCallback, type FC } from 'react';
import cn from './stroke.module.less';

export const RESULT_STROKE_OPTIONS: { value: Stroke; label: string; icon: typeof ButterflyIcon }[] = [
  { value: 'butterfly', label: 'Баттерфляй', icon: ButterflyIcon },
  { value: 'backstroke', label: 'Спина', icon: BackstrokeIcon },
  { value: 'breaststroke', label: 'Брасс', icon: BreaststrokeIcon },
  { value: 'freestyle', label: 'Кроль', icon: FreestyleIcon },
  { value: 'medley', label: 'Комплекс', icon: MedleyIcon },
];

const StrokeRadio: FC<{ onChange: (s: Stroke) => void; value: Stroke; className?: string; }> = ({ onChange, value, className }) => {
  const handler = useCallback((e) => {
    onChange(e.target.value)
  }, [onChange]);
  return (
    <Radio.Group
      className={className}
      optionType="button"
      value={value}
      onChange={handler}
      options={RESULT_STROKE_OPTIONS.map(({ value, label, icon: Icon }) => ({
        value,
        label: (
          <Tooltip title={label}>
            <span className={cn.strokeIcon}>
              <Icon />
            </span>
          </Tooltip>
        ),
      }))}
    />
  );
};

export { StrokeRadio };
