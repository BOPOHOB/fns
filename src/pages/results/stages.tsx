import { type FC, type ReactNode } from "react";
import { Link } from "react-router";
import type { Result } from "../../model/result";
import { distanceName, stringifySeconds } from "../../shared/format";
import { resultPagePath } from "../../shared/publicOrigin";
import type { ResultRow } from "../../model/resultRow";

import cn from "./stages.module.less";

const CELL_WIDTH = 76;
const CELL_GAP = 1;

const StagesBadge: FC<{ result: Result }> = ({ result }) => {
  if (result.stages.length === 0) {
    return (
      <div className={cn.badge}>
        <div>{distanceName(result.distance, true)}</div>
        <div>{stringifySeconds(result.result)}</div>
      </div>
    );
  }
  const badges: Array<ReactNode> = [];
  let pos = 0;
  const step = result.stageStep;
  for (const stage of result.stages) {
    pos += stage.distance;
    const span = stage.distance / step;
    const style =
      span === 1
        ? undefined
        : { width: (CELL_WIDTH + CELL_GAP) * span - CELL_GAP, minWidth: (CELL_WIDTH + CELL_GAP) * span - CELL_GAP };

    badges.push(
      <div key={pos} style={style} className={cn.badge}>
        <div>{span === 1 ? String(pos) : `${pos - stage.distance} - ${pos}`}</div>
        <div>
          {
            span !== 1 
              ? `${stringifySeconds(stage.result)} (${stringifySeconds((stage.result / stage.distance) * 100)})`
              : stringifySeconds(stage.result)
          }
        </div>
      </div>,
    );
  }
  return <div className={cn.stages}>{badges}</div>;
};

const ResultBadge: FC<{ result: ResultRow }> = ({ result }) => (
  <Link to={resultPagePath(result.id)} className={cn.badgeLink}>
    <div className={cn.badge}>
      <div>{stringifySeconds(result.result)}</div>
      <div>{stringifySeconds(result.speed)}</div>
    </div>
  </Link>
);

export { StagesBadge, ResultBadge, cn as stagesCn };
