import { Button, Table, Typography } from 'antd';
import { Link } from 'react-router';
import type { ColumnsType } from 'antd/es/table';
import { observer } from 'mobx-react';
import { useSwimmer } from '../../router/swimmerOutline';
import { useResults } from '../../model/results';
import { stringifySeconds } from '../../utils/stringifySeconds';
import { distanceName } from '../addResult/distanceSelect';
import type { ResultCondition, Stages, WaterType } from '../../types/result';

import cn from './swimmer.module.less';

type ResultRow = {
  key: number;
  distance: number;
  time: string;
  speed: string;
  date?: string;
  water: WaterType;
  condition: ResultCondition | 'open';
  stages: Stages;
};

const CONDITION_LABEL: Record<ResultCondition | 'open', string> = {
  competition: 'Соревнования',
  open: 'Открытая вода',
  test: 'Контрольный заплыв',
  workout: 'Тренировка',
};

const WATER_LABEL: Record<WaterType, string> = {
  fifty: '50м',
  quarter: '25м',
  open: 'Открытая вода',
};

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function formatSpeed(distance: number, seconds: number): string {
  if (!distance) return '—';
  return ((seconds / distance) * 100).toFixed(1);
}

function renderStages(stages: Stages) {
  if (!stages.length) return '—';
  return (
    <ul className={cn.stages}>
      {stages.map((stage, i) => (
        <li key={`${stage.distance}-${i}`}>
          <span>{distanceName(stage.distance, true)}</span>
          <span>{stringifySeconds(stage.result)}</span>
          <span>{formatSpeed(stage.distance, stage.result)}</span>
        </li>
      ))}
    </ul>
  );
}

const Swimmer = observer(() => {
  const swimmer = useSwimmer();
  const results = useResults();

  const teamNames = swimmer.teamIds
    .map((id) => results.teams.find((t) => t.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  const rows: ResultRow[] = [...swimmer.results]
    .sort((a, b) => a.distance - b.distance || a.date.valueOf() - b.date.valueOf())
    .map((r) => ({
      key: r.id,
      distance: r.distance,
      time: stringifySeconds(r.result),
      speed: formatSpeed(r.distance, r.result),
      date: r.date.isValid()
        ? `${r.date.date()} ${MONTHS[r.date.month()]} ${r.date.year()}`
        : undefined,
      water: r.water,
      condition: r.condition,
      stages: r.stages,
    }));

  const columns: ColumnsType<ResultRow> = [
    {
      title: 'Дистанция',
      dataIndex: 'distance',
      width: 100,
      render: (v: number) => distanceName(v, true),
    },
    { title: 'Время', dataIndex: 'time', width: 100 },
    { title: 'Темп', dataIndex: 'speed', width: 80 },
    {
      title: 'Разбивка',
      dataIndex: 'stages',
      render: renderStages,
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Тип бассейна',
      dataIndex: 'water',
      render: (v: WaterType) => WATER_LABEL[v],
    },
    {
      title: 'Условия',
      dataIndex: 'condition',
      render: (v: ResultCondition | 'open') => CONDITION_LABEL[v],
    },
  ];

  return (
    <div className={cn.page}>
      <Button type="link" className={cn.back}>
        <Link to="/">← Назад</Link>
      </Button>
      <Typography.Title level={3}>{swimmer.name}</Typography.Title>
      <Typography.Paragraph type="secondary">
        {[
          teamNames || null,
          swimmer.sex === 'male' ? 'мужской' : 'женский',
          swimmer.age !== undefined ? `${swimmer.age} лет` : null,
          swimmer.birthDate ?? null,
        ].filter(Boolean).join(' · ')}
      </Typography.Paragraph>
      <Table
        size="small"
        pagination={false}
        columns={columns}
        dataSource={rows}
        locale={{ emptyText: 'Нет результатов' }}
      />
    </div>
  );
});

export { Swimmer };
