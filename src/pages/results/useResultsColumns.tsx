import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router';
import { Fragment } from 'react';
import { stringifySeconds } from '../../utils/stringifySeconds';
import type { ResultCondition, Stages, WaterType } from '../../types/result';
import type { Result } from '../../model/result';

import cn from './resultsColumns.module.less';
import type { Swimmer } from '../../model/swimmer';

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

function renderStages(stages: Stages, result: Result) {
  if (!stages.length) {
    return (
      <div className={cn.stages}>
        <div className={cn.cell}>{result.distanceName}</div>
        <div className={cn.cell}>{stringifySeconds(result.result)}</div>
      </div>
    );
  }
  return (
    <div className={cn.stages}>
      {stages.map((stage, i) => (
        <Fragment key={i}>
          <div className={cn.cell}>{stages.slice(0, i + 1).reduce((sum, v) => sum + v.distance, 0)}</div>
          <div className={cn.cell}>{stringifySeconds(stage.result)}</div>
        </Fragment>
      ))}
    </div>
  );
}

const renderResult = (_: never, result: Result) => {
  return (
    <div className={cn.stages}>
      <div className={cn.cell}>{stringifySeconds(result.result)}</div>
      <div className={cn.cell}>{stringifySeconds(result.speed)}</div>
    </div>
  );
};

const c = function<T>(condition: boolean, value: T): [] | [T] { return condition ? [value] : []; };

function useResultsColumns(kind: 'swimmer' | 'day'): ColumnsType<Result> {
  return [
    ...c(kind === 'day', {
      title: 'Пловец',
      dataIndex: 'swimmer',
      render: (swimmer: Swimmer) => (
        <Link to={`/${swimmer.id}`}>{swimmer.name}</Link>
      ),
    }),
    { title: 'Результат', dataIndex: 'time', width: 100, render: renderResult },
    {
      title: 'Разбивка',
      dataIndex: 'stages',
      render: renderStages,
    },
    ...c(kind === 'swimmer', {
      title: 'Дата',
      dataIndex: 'date',
      render: (v?: string) => v ?? '—',
    }),
    {
      title: 'Тип бассейна',
      dataIndex: 'water' as const,
      render: (v: WaterType) => WATER_LABEL[v],
    },
    {
      title: 'Условия',
      dataIndex: 'condition' as const,
      render: (v: ResultCondition | 'open') => CONDITION_LABEL[v],
    },
  ];
}

export {
  useResultsColumns,
};
