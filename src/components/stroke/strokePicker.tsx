import { Radio, Tooltip } from 'antd';
import type { Stroke } from '../../types/result';
import {
  BackstrokeIcon,
  BreaststrokeIcon,
  ButterflyIcon,
  FreestyleIcon,
  MedleyIcon,
} from './icons';
import { useCallback, type FC } from 'react';
import cn from './stroke.module.less';

const STROKE_LIST = [
  'butterfly',
  'backstroke',
  'breaststroke',
  'freestyle',
  'medley',
] as const satisfies readonly Stroke[];

const STROKE_ICON = {
  butterfly: ButterflyIcon,
  backstroke: BackstrokeIcon,
  breaststroke: BreaststrokeIcon,
  freestyle: FreestyleIcon,
  medley: MedleyIcon,
} as const;

const STROKE_LABEL: Record<Stroke, string> = {
  butterfly: 'Баттерфляй',
  backstroke: 'Спина',
  breaststroke: 'Брасс',
  freestyle: 'Кроль',
  medley: 'Комплекс',
};

const StrokePicker: FC<{
  onChange: (s: Stroke) => void;
  value: Stroke | null;
  className?: string;
}> = ({ onChange, value, className }) => {
  const handler = useCallback(
    (e: { target: { value: Stroke } }) => {
      onChange(e.target.value);
    },
    [onChange],
  );
  return (
    <Radio.Group
      className={className}
      optionType="button"
      value={value ?? undefined}
      onChange={handler}
      options={STROKE_LIST.map((stroke) => {
        const Icon = STROKE_ICON[stroke];
        return {
          value: stroke,
          label: (
            <Tooltip title={STROKE_LABEL[stroke]}>
              <span className={cn.strokeIcon}>
                <Icon />
              </span>
            </Tooltip>
          ),
        };
      })}
    />
  );
};

export { StrokePicker, STROKE_LIST, STROKE_ICON, STROKE_LABEL };
