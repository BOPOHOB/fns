import type { FC, ReactNode } from 'react';
import type { Stroke } from '../../types/result';
import { AsyncSelect } from '../asyncSelect';
import { STROKE_ICON, STROKE_LABEL, STROKE_LIST } from './strokePicker';

import cn from './stroke.module.less';

function strokeOptionLabel(stroke: Stroke): ReactNode {
  const Icon = STROKE_ICON[stroke];
  return (
    <span className={cn.strokeSelectOption}>
      <span className={cn.strokeSelectIcon}>
        <Icon />
      </span>
      {STROKE_LABEL[stroke]}
    </span>
  );
}

const STROKE_OPTIONS = STROKE_LIST.map((stroke) => ({
  value: stroke,
  label: strokeOptionLabel(stroke),
}));

const StrokeSelect: FC<{
  value: Stroke | null;
  onChange: (stroke: Stroke) => void | Promise<unknown>;
  className?: string;
}> = ({ value, onChange, className }) => (
  <AsyncSelect<Stroke>
    className={`${cn.strokeSelect}${className ? ` ${className}` : ''}`}
    size="small"
    value={value ?? undefined}
    options={STROKE_OPTIONS}
    placeholder="Стиль"
    popupMatchSelectWidth={false}
    labelRender={({ value: v }) => {
      const stroke = v as Stroke;
      const Icon = STROKE_ICON[stroke];
      if (!Icon) return null;
      return (
        <span className={cn.strokeSelectIcon} title={STROKE_LABEL[stroke]}>
          <Icon />
        </span>
      );
    }}
    onChange={(stroke) => onChange(stroke)}
  />
);

export { StrokeSelect };
