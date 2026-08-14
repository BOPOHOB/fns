import { useEffect, type FC, type ReactElement } from "react";
import type { Stage, StagesRawInput } from "./stages";
import { TimeInput } from "./timeInput";
import { Button } from "antd";
import { MergeCellsOutlined } from "@ant-design/icons";

import cn from './stagesMatrix.module.less';

const StagesMatrix: FC<{
  value: StagesRawInput[];
  // Фактически строка и столбец передаются чтобы вывести результат если заполнены только этапы
  onChange: (value: StagesRawInput[], repeat: number, stage: number) => void;
  step: Stage,
  inputClassName?: string;
  results: Array<number | null>;
  autoMinute?: boolean;
}> = ({ onChange, value, step, inputClassName, results, autoMinute=false }) => {
  const matrix: Array<ReactElement> = [];

  const onStageChange = (colIdx: number, index: number) => (val: null | number) => {
    const next = structuredClone(value);
    next[colIdx][index].result = val;
    onChange(next, colIdx, index);
  };

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

  const join = (colIdx: number, index: number) => () => {
    const next = structuredClone(value);
    const repeat = next[colIdx];
    console.assert(index < repeat.length - 1, `index ${index} must be less then ${repeat.length - 1}`);
    const [s] = repeat.splice(index, 1);
    const acceptor = repeat[index];
    acceptor.distance += s.distance;
    acceptor.result = acceptor.result === null && s.result === null ? null : ((s.result ?? 0) + (acceptor.result ?? 0));
    onChange(next, colIdx, index);
  };

  // Заполнение последней строки
  useEffect(() => {
    const next = structuredClone(value);
    let isChanged = false;
    let row = -1;
    let col = -1;
    for (let i = 0; i < next.length; ++i) {
      let isReady = results[i] !== null;
      for (let j = 0; j < next[i].length - 1; ++j) {
        if (next[i][j].result === null) {
          isReady = false;
        }
      }
      if (isReady) {
        const computed = results[i] - next[i].slice(0, -1).reduce((prw, cur) => prw + cur.result, 0);
        if (next[i].at(-1).result !== computed) {
          isChanged = true;
          next[i].at(-1).result = computed;
        }
      } else if (next[i].length > 0 && next[i].at(-1).result !== null) {
        isChanged = true;
        next[i].at(-1).result = null;
        col = i;
        row = next[i].length - 1;
      }
    }

    if (isChanged) {
      onChange(next, col, row);
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
            <TimeInput
              className={inputClassName}
              tabIndex={col + 1}
              autoMinute={autoMinute}
              placeholder={span === 1 ? `${row + 1} этап` : `${row + 1} - ${row + span} этапы`}
              onChange={onStageChange(col, index)}
              value={repeat[index].result}
            />
            {Boolean(row) && (
              <Button
                size="small"
                className={cn.join}
                icon={<MergeCellsOutlined />}
                onClick={join(col, index - 1)}
                variant="text"
              />
            )}
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
