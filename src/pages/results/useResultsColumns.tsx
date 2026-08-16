import type { ColumnsType } from 'antd/es/table';
import { Link } from 'react-router';
import type { ResultCondition, WaterType } from '../../types/result';
import type { Result } from '../../model/result';

import type { Swimmer } from '../../model/swimmer';
import type { Dayjs } from 'dayjs';
import { formatRuDate } from '../../utils/formatRuDate';
import { ResultBadge, StagesBadge, stagesCn } from './stages';
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

/** Мин. ширина таблицы до горизонтального скролла (фикс. колонки + минимум под разбивку). */
function resultsTableScrollX(kind: "swimmer" | "day"): number {
  return kind === "day" ? 800 : 700;
}

function useResultsColumns(kind: 'swimmer' | 'day'): ColumnsType<Result> {
  return [
    ...c(kind === 'day', {
      title: 'Пловец',
      dataIndex: 'swimmer',
      width: 160,
      render: (swimmer: Swimmer) => (
        <Link to={`/${swimmer.id}`}>{swimmer.name}</Link>
      ),
    } as const),
    {
      title: 'Результат',
      dataIndex: 'time',
      width: 80,
      render: (_: never, result: Result) => <ResultBadge result={result} />,
    },
    {
      title: 'Разбив',
      dataIndex: 'stages',
      // Гибкая колонка: забирает остаток ширины — внутри flex может переносить бейджи
      onCell: () => ({ className: stagesCn.stagesCell }),
      render: renderStages,
    },
    ...c(kind === 'swimmer', {
      title: 'Дата',
      dataIndex: 'date',
      width: 120,
      render: (v?: Dayjs) => formatRuDate(v) ?? '—',
    }),
    {
      title: 'Вода',
      dataIndex: 'water' as const,
      width: 100,
      render: (v: WaterType) => WATER_LABEL[v],
    },
    {
      title: 'Условия',
      dataIndex: 'condition' as const,
      width: 140,
      render: (v: ResultCondition | 'open') => CONDITION_LABEL[v],
    },
    {
      title: 'Заметки',
      dataIndex: 'notes' as const,
      width: 160,
    }
  ];
}

export {
  useResultsColumns,
  resultsTableScrollX,
};
