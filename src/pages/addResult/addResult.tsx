import { useEffect, useState } from 'react';
import { Button, DatePicker, Radio, Typography, Space, Alert, InputNumber, Tooltip } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { Link, useNavigate } from 'react-router';
import type { ResultCondition, WaterType } from '../../types/result';

import cn from './addResult.module.less';
import { useSwimmer } from '../../router/swimmerOutline';
import { AsyncButton } from '../../components/asyncButton';
import TextArea from 'antd/es/input/TextArea';
import { STAGE_INTERVALS, type Stage, type StagesRawInput } from './stages';
import { TimeInput } from './timeInput';
import { DistanceSelect } from './distanceSelect';
import { useStorageState } from '../../utils/useStorageState';
import { useResults } from '../../model/results';
import { useSeriesController } from './useSeriesController';
import { plural } from '../../utils/plural';
import { StagesOpen } from './stagesOpen';
import { StagesMatrix } from './stagesMatrix';
import { CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { normalizeSpeed, isSpeedDistributed, stagesSpeed } from './speedChecker';

export const RESULT_CONDITION_OPTIONS: { value: ResultCondition; label: string }[] = [
  { value: 'competition', label: 'Соревнования' },
  { value: 'test', label: 'Контрольный заплыв' },
  { value: 'workout', label: 'Тренировка' },
];

export const RESULT_WATER_OPTIONS: { value: WaterType; label: string }[] = [
  { value: 'quarter', label: 'Четвертак' },
  { value: 'fifty', label: 'Полтинник' },
  { value: 'open', label: 'Открытая вода' },
];

const OPEN_MIN_DISTANCE = 500;

const isHaveMultiplicity = (val: number, div: number) => Math.floor(val / div) === val / div && val / div > 1;

function resize<T>(arr: Array<T>, size: number, initialValue: (id: number) => T) {
  if (arr.length === size) {
    return arr;
  }
  return arr.slice(0, size).concat(new Array(Math.max(0, size - arr.length)).fill(null).map((_, id) => initialValue(id)));
}

const AddResult = () => {
  const navigate = useNavigate();
  const swimmer = useSwimmer();
  const results = useResults();

  const [distance, setDistance] = useStorageState<number>(50, 'addResult.distance');
  const [date, setDate] = useStorageState<Dayjs>(() => dayjs(), 'addResult.date');
  const [water, setWater] = useStorageState<WaterType>('quarter', 'addResult.water');
  const [repeat, setRepeat] = useStorageState<number>(1, 'addResult.repeat');
  const [result, setResult] = useState<Array<number | null>>(new Array(repeat).fill(null));
  const {
    speed, setSpeed,
    pause, setPause,
    interval, setInterval
  } = useSeriesController();
  const [condition, setCondition] = useStorageState<ResultCondition>('workout', 'addResult.condition');
  const [notes, setNotes] = useState('');
  const [stages, setStages] = useState<StagesRawInput[]>([[]]);
  const [stageInterval, setStageInterval] = useStorageState<Stage | null>(100, 'addResult.stage');

  const setResultItem = (id: number) => (value: number | null) => {
    const newResult = [...result];
    newResult[id] = value;
    setResult(newResult);
  };

  const setRepeatStages = (repeatId: number) => (value: StagesRawInput) => {
    const newStages = [...stages];
    newStages[repeatId] = value;
    setStages(newStages);
  };

  // Выключаем серии на открытой воде
  useEffect(() => {
    if (water === 'open' && repeat !== 1) {
      setRepeat(1);
    }
  }, [water]);

  // Настраиваем размер результатов под число повторений
  useEffect(() => {
    setResult((result) => resize(result, repeat, () => null));
  }, [repeat]);

  // Выравниваем размер стейджей согласно шагу, повторам и дистанции
  useEffect(() => {
    if (water === 'open') {
      setStages([[]]);
      return;
    }
    const steps = distance / stageInterval;
    const stageConstructor = () => ({
      result: null,
      distance: stageInterval
    });
    setStages(stageInterval === null ? [[]] : new Array(repeat).fill(null).map(() => new Array(steps).fill(null).map(stageConstructor)));
  }, [repeat, stageInterval, distance, water])

  // Подравнять шаг
  useEffect(() => {
    if (!isHaveMultiplicity(distance, stageInterval)) {
      setStageInterval(({
        25: null,
        50: null,
        100: 50,
      } as const)[distance] ?? 100);
    }
  }, [distance]);

  // Выключаем открытую воду на коротких дистанциях
  useEffect(() => {
    if (distance < OPEN_MIN_DISTANCE) {
      setWater((water) => water === 'open' ? 'fifty' : water);
    }
  }, [distance]);

  const [error, setError] = useState();

  const handleSave = async () => {
    try {
      await results.addResult({
        swimmerId: swimmer.id,
        distance,
        result,
        water,
        type: condition,
        date: date.toISOString(),
        notes,
        stages,
        speed,
        interval
      });
      navigate('/');
    } catch (error) {
      setError(error);
    }
  };

  if (error) {
    return (
      <div className={cn.page}>
        <Alert
          type="error"
          className={cn.rate}
          title={error}
        />
        <Button type="link" onClick={() => setError(null)} style={{ padding: 0 }}>
          Закрыть
        </Button>
      </div>
    );
  }

  const stagesSelector = (
    <Radio.Group
      className={cn.waterSelector}
      optionType="button"
      value={stageInterval ?? 0}
      onChange={(e) => {setStageInterval(e.target.value === 0 ? null : e.target.value);}}
      options={STAGE_INTERVALS.map(v => ({ ...v, disabled: !isHaveMultiplicity(distance, v.value) }))}
    />
  );

  const errorMessage = (() => {
    if (repeat === 0) {
      return "Число повторений не задано";
    }
    for (const [id, val] of result.entries()) {
      if (val === null) {
        if (repeat === 1) {
          return "Результат не заполнен";
        }
        return `Результат ${id + 1} не заполнен`;
      }
    }
    for (const stage of stages) {
      let isEmpty = true;
      let isFilled = true;
      for (const { result } of stage) {
        if (result !== null) {
          isEmpty = false;
        }
        if (result === null) {
          isFilled = false;
        }
      }
      if (!isEmpty && !isFilled) {
        if (repeat !== 1) {
          return `Этап ${stages.indexOf(stage) + 1} заполнен частично. Разбивку нужно либо заполнить полностью либо оставить пустой целиком`;
        } else {
          return 'Разбивка заполнена частично. Надо либо заполнить полностью либо оставить пустой';
        }
      }
      if (stage.at(-1).result < 0) {
        return `Время в разбивке ${stages.indexOf(stage) + 1} не совпадает с результатом`;
      }
    }
    return null;
  })();
  const warnMessage = (() => {
    if (repeat !== 1) {
      if (speed === null) {
        return "Не задан темп серии";
      }
      if (interval === null) {
        return "Не задан интервал серии";
      }
    }
    if (isSpeedDistributed(normalizeSpeed(result, distance))) {
      return "Скорости, указанные в результатах существенно отличаются";
    }
    for (const [id, stage] of stages.entries()) {
      if (isSpeedDistributed(stagesSpeed(stage))) {
        return `Скорости в разбивке на этапе ${id + 1} сильно отличаются между собой`;
      }
    }
    return null;
  })();

  return (
    <div className={cn.page}>
      <Typography.Title level={3}>
        Добавить результат — <Link to={`/${swimmer.id}`}>{swimmer.name}</Link>
      </Typography.Title>

      <DistanceSelect
        className={cn.field}
        value={distance}
        onChange={setDistance}
      />
      <DatePicker
        className={cn.field}
        format="DD.MM.YYYY"
        value={date}
        onChange={(d) => d && setDate(d)}
      />
      <Radio.Group
        className={cn.field}
        optionType="button"
        value={water}
        onChange={(e) => setWater(e.target.value)}
        options={RESULT_WATER_OPTIONS.map((v) => ({
          ...v,
          disabled: v.value === 'open' && distance < OPEN_MIN_DISTANCE
        }))}
      />
      <Radio.Group
        className={cn.field}
        optionType="button"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        options={RESULT_CONDITION_OPTIONS}
      />
      {water !== 'open' && (
        <div className={cn.row}>
          <InputNumber min={1} max={300} value={repeat || null} onChange={(v) => setRepeat(v ?? 0)} />
          <p>{plural(repeat, ['повторение', 'повторений', 'повторения'])}</p>
        </div>
      )}
      {repeat > 1 && (
        <>
          <div className={cn.tripletTitle}>
            <p>Режим</p>
            <p>Темп</p>
            <p>Пауза</p>
          </div>
          <div className={cn.triplet}>
            <TimeInput
              className={cn.field}
              value={interval}
              onChange={setInterval}
              placeholder="Интервал"
              disabled={repeat === 1}
            />
            <TimeInput
              className={cn.field}
              value={speed}
              onChange={setSpeed}
              placeholder="Темп"
              disabled={repeat === 1}
            />
            <TimeInput
              className={cn.field}
              value={pause}
              onChange={setPause}
              placeholder="Пауза"
              disabled={repeat === 1}
            />
          </div>
        </>
      )}
      <div className={cn.scroll}>
        <div className={cn.results}>
          {
            result.map((v, id) => (
              <TimeInput className={cn.input} tabIndex={id + 1} key={id} value={v} onChange={setResultItem(id)} placeholder={repeat === 1 ? 'Результат' : `${id + 1} повторение`} />
            ))
          }
        </div>
        {water !== 'open' && stageInterval !== null && stagesSelector}
        {
          water === 'open' ? <StagesOpen target={result[0]} value={stages[0]} onChange={setRepeatStages(0)} distance={distance} />
          : (stageInterval !== null && <StagesMatrix results={result} inputClassName={cn.input} step={stageInterval} value={stages} onChange={setStages} />)
        }
      </div>
      {water !== 'open' && stageInterval === null && stagesSelector}
      <TextArea tabIndex={repeat + 1} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Заметки" />

      <Space>
        <Button onClick={() => navigate('/')}>Отмена</Button>
        <Tooltip title={errorMessage ?? warnMessage}>
          <AsyncButton
            icon={errorMessage ? <CloseCircleOutlined /> : (warnMessage ? <WarningOutlined /> : undefined)}
            color={warnMessage ? 'danger' : 'default'}
            type="primary"
            disabled={Boolean(errorMessage)}
            onClick={handleSave}
          >
            Сохранить
          </AsyncButton>
        </Tooltip>
      </Space>
    </div>
  );
};

export { AddResult };
