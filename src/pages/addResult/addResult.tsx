import { useState } from 'react';
import { Button, DatePicker, Radio, Typography, Space, Alert } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { observer } from 'mobx-react';
import { Link, useNavigate } from 'react-router';
import type { ResultCondition, WaterType } from '../../types/result';

import cn from './addResult.module.less';
import { useSwimmer } from '../../router/swimmerOutline';
import { AsyncButton } from '../../components/asyncButton';
import { submitResult } from '../../api/results';
import TextArea from 'antd/es/input/TextArea';
import { Stages, type StagesRawInput } from './stages';
import { ResultInput } from './resultInput';
import { DistanceSelect } from './distanceSelect';
import { useStorageState } from '../../utils/useStorageState';
import { useResults } from '../../model/results';

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

const AddResult = () => {
  const navigate = useNavigate();
  const swimmer = useSwimmer();
  const results = useResults();

  const [distance, setDistance] = useStorageState<number>(50, 'addResult.distance');
  const [time, setTime] = useState<number | null>(null);
  const [date, setDate] = useStorageState<Dayjs>(() => dayjs(), 'addResult.date');
  const [water, setWater] = useStorageState<WaterType>('quarter', 'addResult.water');
  const [condition, setCondition] = useStorageState<ResultCondition>('workout', 'addResult.condition');
  const [notes, setNotes] = useState('');
  const [stages, setStages] = useState<StagesRawInput>([]);

  const stagesResult = stages.reduce((prv, { result }) => prv + result, 0);
  const stagesDistance = stages.reduce((prv, { distance }) => prv + distance, 0);

  const valid = time !== null
    && stages.find(v => v.result === null) === undefined
    && (stagesDistance === distance || stagesDistance === 0)
    && (stagesResult === time || stagesResult === 0);

  const [error, setError] = useState();

  const handleSave = async () => {
    try {
      const result = await submitResult({
        swimmerId: swimmer.id,
        distance,
        result: time!,
        water,
        type: condition,
        date: date.toISOString(),
        notes,
        stages,
      });
      results.addResult(result);
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
      <ResultInput
        className={cn.field}
        value={time}
        onChange={setTime}
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
        options={RESULT_WATER_OPTIONS}
      />
      <Radio.Group
        className={cn.field}
        optionType="button"
        value={condition}
        onChange={(e) => setCondition(e.target.value)}
        options={RESULT_CONDITION_OPTIONS}
      />
      <Stages target={time} value={stages} onChange={setStages} water={water} distance={distance} />
      <TextArea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Заметки" />

      <Space>
        <Button onClick={() => navigate('/')}>Отмена</Button>
        <AsyncButton type="primary" disabled={!valid} onClick={handleSave}>
          Сохранить
        </AsyncButton>
      </Space>
    </div>
  );
};

export { AddResult };
