import { useEffect, type FC, type ReactElement } from "react";
import type { Stage, StagesRawInput } from "./stages";
import { TimeInput } from "./timeInput";
import { Button } from "antd";
import { MergeCellsOutlined } from "@ant-design/icons";

import cn from './stagesMatrix.module.less';

const StagesMatrix: FC<{
  value: StagesRawInput[];
  onChange: (value: StagesRawInput[]) => void;
  step: Stage,
  inputClassName?: string;
  results: Array<number | null>;
}> = ({ onChange, value, step, inputClassName, results }) => {
  const matrix: Array<ReactElement> = [];
  const onStageChange = (row: number, col: StagesRawInput) => (val: null | number) => {
    col[row].result = val;
    onChange(structuredClone(value));
  }

  const rows = (value.at(0)?.reduce((prw, cur) => cur.distance + prw, 0) ?? 0) / step;

  const findIndex = (repeat: StagesRawInput, row: number): number | null => {
    let index = 0;
    let iter = 0;
    while (iter < row && index < repeat.length) {
      iter += repeat[index].distance / step;
      index += 1;
    }
    return iter === row && index < repeat.length ? index : null;
  };

  const join = (repeat: StagesRawInput, index: number) => () => {
    console.assert(index < repeat.length - 1, `index ${index} must be less then ${repeat.length - 1}`);
    const [s] = repeat.splice(index, 1);
    const acceptor = repeat[index];
    acceptor.distance += s.distance;
    acceptor.result = acceptor.result === null && s.result === null ? null : ((s.result ?? 0) + (acceptor.result ?? 0));
    onChange(structuredClone(value));
  };

  useEffect(() => {
    let isChanged = false;
    for (let i = 0; i < value.length; ++i) {
      let isReady = results[i] !== null;
      for (let j = 0; j < value[i].length - 1; ++j) {
        if (value[i][j].result === null) {
          isReady = false;
        }
      }
      if (isReady) {
        const computed = results[i] - value[i].slice(0, -1).reduce((prw, cur) => prw + cur.result, 0);;
        if (value[i].at(-1).result !== computed) {
          isChanged = true;
          value[i].at(-1).result = computed;
        } 
      } else if (value[i].length > 0 && value[i].at(-1).result !== null) {
        isChanged = true;
        value[i].at(-1).result = null;
      }
    }

    if (isChanged) {
      onChange(structuredClone(value));
    }
  }, [results, value]);

  for (let row = 0; row < rows; ++row) {
    for (const [col, repeat] of value.entries()) {
      const index = findIndex(repeat, row);
      if (index !== null) {

        const span = repeat[index].distance / step;
        const style = span === 1 ? undefined : { gridRowEnd: `span ${span}`, height: 27 * span };
        
        matrix.push(
          <div key={`${row}_${col}`} style={style}>
            <TimeInput disabled={index + 1 === repeat.length} className={inputClassName} tabIndex={col + 1} placeholder={span === 1 ? `${row + 1} этап` : `${row + 1} - ${row + span} этапы`} onChange={onStageChange(row, repeat)} value={repeat[index].result} />
            { Boolean(row) && <Button
              size="small"
              className={cn.join}
              icon={<MergeCellsOutlined />}
              onClick={join(repeat, index - 1)}
              variant="text"
            /> }
          </div>
        );
      }
    }
  }

  return (
    <div
      className={cn.matrix}
      style={{ gridTemplateColumns: new Array(value.length).fill("1fr").join(' ')}}
    >
      {matrix}
    </div>
  );
};

export { StagesMatrix };
