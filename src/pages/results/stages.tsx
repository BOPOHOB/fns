import { Fragment, type FC } from "react";
import type { Result } from "../../model/result";
import { stringifySeconds } from "../../utils/stringifySeconds";

import cn from './stages.module.less';
import type { Stages } from "../../types/result";

const Row: FC<{ stageStep: number; stages: Stages; pos?: number }> = ({ stageStep, stages, pos = 0 }) => {
  return (
    <div className={cn.stages}>
      {stages.map((stage, i) => {
        const span = stage.distance / stageStep;
        pos += stage.distance;
        const style = span === 1 ? undefined : { width: 71 * span  - 1 };
        return (
          <Fragment key={i}>
            <div style={style} className={cn.cell}>{span === 1 ? pos : `${pos - stage.distance} - ${pos}`}</div>
            <div style={style} className={cn.cell}>{[stringifySeconds(stage.result), span !== 1 && `(${stringifySeconds(stage.result / stage.distance * 100)})`].filter(Boolean).join(' ')}</div>
          </Fragment>
        );
      })}
    </div>
  );
};

const StagesBadge: FC<{ result: Result }> = ({ result }) => {
  const { stages } = result;
  if (!stages.length) {
    return (
      <div className={cn.stages}>
        <div className={cn.cell}>{result.distanceName}</div>
        <div className={cn.cell}>{stringifySeconds(result.result)}</div>
      </div>
    );
  }
  const { stageStep } = result;
  const stagesAmount = result.distance / stageStep;
  if (stagesAmount < 8) {
    return <Row stages={stages} stageStep={stageStep} />;
  }
  let pos = 0;
  const stageChunkLength = {
    8: 4, 9: 5, 10: 5, 11: 5, 12: 6, 13: 6, 14: 7, 15: 5, 16: 6, 17: 6, 18: 6, 19: 5, 20: 5, 21: 7, 22: 6, 23: 6, 24: 6, 25: 5, 26: 7, 27: 7, 28: 7, 29: 5, 30: 5
  }[stagesAmount] ?? 6;
  const chunks = (() => {
    const result = [];
    let passed = 0;
    let cur = 0;
    for (let [id, { distance }] of stages.entries()) {
      if (passed >= stageChunkLength) {
        result.push(stages.slice(cur, id));
        cur = id;
        passed = 0;
      }
      passed += distance / stageStep;
    }
    if (passed !== 0) {
      result.push(stages.slice(cur));
    }
    return result;
  })();
  return (
    <div className={cn.rows}>
      {chunks.map((chunk, id) => {
        const cur = pos;
        pos += chunk.reduce((sum, cur) => sum + cur.distance, 0);
        return (<Row key={id} stages={chunk} stageStep={stageStep} pos={cur} />);
      })}
    </div>
  );
};

const ResultBadge: FC<{result: Result}> = ({ result }) => (
  <div className={cn.stages}>
    <div className={cn.cell}>{stringifySeconds(result.result)}</div>
    <div className={cn.cell}>{stringifySeconds(result.speed)}</div>
  </div>
);

export { StagesBadge, ResultBadge };
