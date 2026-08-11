import { useEffect, useState, type FC } from "react";
import type { Stages as StagesData } from "../../types/result";
import { Alert, Button, InputNumber } from "antd";
import { TimeInput } from "./timeInput";
import { CloseCircleOutlined, FieldTimeOutlined, PlusOutlined } from "@ant-design/icons";

import cn from './stagesOpen.module.less';
import { distanceName } from "./distanceSelect";
import { stringifySeconds } from "../../utils/stringifySeconds";
import { plural } from "../../utils/plural";
import type { StagesRawInput } from "./stages";

const Rate: FC<{ result: number, distance: number }> = ({ result, distance }) => {
  const rate = result / distance * 100;
  const grade = (['error', 'warning', 'success', 'info'] as const)[[60, 90, 120, Infinity].findIndex(v => rate < v)];
  return (
    <Alert
      type={grade}
      className={cn.rate}
      title={<><FieldTimeOutlined /> {result === null ? '—' : stringifySeconds(rate)}</>}
    />
  );
};

const StagesOpen: FC<{
  onChange: (v: StagesData) => void;
  value: StagesRawInput;
  distance: number;
  target: number;
}> = ({ target, distance, onChange, value }) => {
  const elapsedDistance = value?.reduce((prev, { distance }) => prev + distance, 0);
  const elapsedTime = value?.reduce((prev, { result }) => prev + result, 0);
  const allow = distance - elapsedDistance;
  const disableExt = allow <= 0;
  const [openInput, setOpenInput] = useState(elapsedDistance === 0 ? distance / 2 : allow);

  const onChangeRow = (index: number, res: number | null, distance: number) => {
    const result = structuredClone(value);
    result[index] = { result: res, distance };
    onChange(result);
  };
  const onRemoveRow = (index: number) => {
    const result = structuredClone(value);
    result.splice(index, 1);
    onChange(result);
  };
  useEffect(() => {
    setOpenInput(elapsedDistance === 0 ? distance / 2 : allow);
  }, [distance, elapsedDistance])
  return (
    <ul className={cn.layout}>
      {value?.map(({ result, distance }, index) => (
        <li key={index}>
          <TimeInput value={result} onChange={(value) => onChangeRow(index, value, distance)} />
          {distanceName(distance, true)}
          <Button
            size="small"
            onClick={() => onRemoveRow(index)}
            icon={<CloseCircleOutlined />}
            variant="text"
          />
          <Rate result={result} distance={distance} />
        </li>
      ))}
      {Boolean(allow) && (
        <li>
          <InputNumber value={openInput} onChange={(e) => setOpenInput(e)} disabled={disableExt} defaultValue={elapsedDistance === 0 ? distance / 2 : allow} max={allow} />
          <Button size="small"
            onClick={() => onChange([...value, { result: openInput === allow ? target - elapsedTime : null, distance: openInput }])}
            icon={<PlusOutlined />}
            disabled={50 > allow || (allow === 50 && value.length === 1)}
          />
          {Boolean(elapsedDistance) && (<Alert className={cn.alert} title={`Осталось ${distanceName(allow)}`} />)}
        </li>
      )}
      {!Boolean(allow) && target !== elapsedTime && target !== null && (
        <li>
          <Alert
            type="warning"
            className={cn.alert}
            title={`Общее время и время разбивки не сошлось, разница ${Math.abs(target - elapsedTime)} ${plural(Math.abs(target - elapsedTime), ['секунда', 'секунд', 'секунды'])}`}
          />
        </li>
      )}
    </ul>
  );
};

export { StagesOpen };
