import type { FC } from 'react';
import { Tooltip } from 'antd';
import type { Stroke } from '../../types/result';
import { STROKE_ICON, STROKE_LABEL } from './strokePicker';
import clsx from "clsx";

import cn from './stroke.module.less';

const StrokeView: FC<{ stroke: Stroke | null; className?: string; }> = ({ stroke, className }) => {
  if (!stroke) return null;
  const Icon = STROKE_ICON[stroke];
  return (
    <Tooltip title={STROKE_LABEL[stroke]}>
      <div className={clsx(className, cn.strokeView)}>
        <Icon />
      </div>
    </Tooltip>
  );
};

export { StrokeView };
