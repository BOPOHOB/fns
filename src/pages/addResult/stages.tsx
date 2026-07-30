import { useEffect, useState, type FC } from "react";
import type { Stages as StagesData, WaterType } from "../../types/result";
import { Alert, Button, InputNumber } from "antd";
import { ResultInput } from "./resultInput";
import { CloseCircleOutlined, FieldTimeOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";

import cn from './stages.module.less';
import { distanceName } from "./distanceSelect";
import { stringifySeconds } from "../../utils/stringifySeconds";
import { plural } from "../../utils/plural";

type StagesRawInput = Array<{
  result: number | null;
  distance: number;
}>;

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

const Stages: FC<{onChange: (v: StagesData) => void, value: StagesRawInput, water: WaterType, distance: number; target: number }> = ({ target, distance, onChange, value, water }) => {
  const elapsedDistance = value.reduce((prev, { distance }) => prev + distance, 0);
  const elapsedTime = value.reduce((prev, { result }) => prev + result, 0);
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
  }, [water, distance, elapsedDistance])
  return (
    <ul className={cn.layout}>
      {value.map(({ result, distance }, index) => (
        <li key={index}>
          <ResultInput value={result} onChange={(value) => onChangeRow(index, value, distance)} />
          {
            water === 'open' ? (
              <>
                {distanceName(distance, true)}
              </>
           ) : (
              <>
                <Button
                  size="small"
                  onClick={() => onChangeRow(index, result, distance - (distance < 100 ? 25 : 50))}
                  icon={<MinusOutlined />}
                  disabled={distance < 50}
                />
                {distanceName(distance, true)}
                <Button size="small"
                  onClick={() => onChangeRow(index, result, distance + (distance < 50 ? 25 : 50))}
                  icon={<PlusOutlined />}
                  disabled={50 > allow || (allow === 50 && value.length === 1)}
                />
              </>
            )
          }
          <Button
            size="small"
            onClick={() => onRemoveRow(index)}
            icon={<CloseCircleOutlined />}
            variant="text"
          />
          <Rate result={result} distance={distance} />
        </li>
      ))}
      {
        Boolean(allow) && (
          <li>
            {
              water === 'open' ? (
                <>
                  <InputNumber value={openInput} onChange={(e) => setOpenInput(e)} disabled={disableExt} defaultValue={elapsedDistance === 0 ? distance / 2 : allow} max={allow} />
                  <Button size="small"
                    onClick={() => onChange([...value, { result: openInput === allow ? target - elapsedTime : null, distance: openInput }])}
                    icon={<PlusOutlined />}
                    disabled={50 > allow || (allow === 50 && value.length === 1)}
                  />
                </>
              ) : (
                <>
                  {[25, 50, 100].map((step => (
                    <Button
                      key={step}
                      disabled={disableExt || allow < step || distance === step}
                      onClick={() => { onChange([...value, { result: step === allow ? target - elapsedTime : null, distance: step }])}}
                      icon={<PlusOutlined />}
                    >{step}</Button>
                  )))}
                </>
              )
            }
            {
              Boolean(elapsedDistance) && (<Alert className={cn.alert} title={`Осталось ${distanceName(allow)}`} />)
            }
          </li>
        )
      }
      {!Boolean(allow) && target !== elapsedTime && target !== null && (<li><Alert type="warning" className={cn.alert} title={`Общее время и время разбивки не сошлось, разница ${Math.abs(target - elapsedTime)} ${plural(Math.abs(target - elapsedTime), ['секунда', 'секунд', 'секунды'])}`} /></li>) }
    </ul>
  );
};

export { Stages, type StagesRawInput };
