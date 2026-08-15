import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router';
import type { ResultCondition, WaterType } from '../../types/result';
import type { Result } from '../../model/result';

import type { Swimmer } from '../../model/swimmer';
import type { Dayjs } from 'dayjs';
import { formatRuDate } from '../../utils/formatRuDate';
import { ResultBadge, StagesBadge } from './stages';
import { c } from '../../utils/c';

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

const renderStages = (_: never, result: Result) => <StagesBadge result={result} />

function useResultsColumns(kind: 'swimmer' | 'day'): ColumnsType<Result> {
  return [
    ...c(kind === 'day', {
      title: 'Пловец',
      dataIndex: 'swimmer',
      render: (swimmer: Swimmer) => (
        <Link to={`/${swimmer.id}`}>{swimmer.name}</Link>
      ),
    } as const),
    { title: 'Результат', dataIndex: 'time', render: (_: never, result: Result) => <ResultBadge result={result} /> },
    {
      title: 'Разбивка',
      dataIndex: 'stages',
      render: renderStages,
    },
    ...c(kind === 'swimmer', {
      title: 'Дата',
      dataIndex: 'date',
      render: (v?: Dayjs) => formatRuDate(v) ?? '—',
    }),
    {
      title: 'Вода',
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
