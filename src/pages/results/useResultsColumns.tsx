import { useState, type FC } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Button, DatePicker, Space, Tooltip, notification } from 'antd';
import { ExportOutlined, FileImageOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router';
import { observer } from 'mobx-react';
import dayjs, { type Dayjs } from 'dayjs';
import type { ResultCondition, WaterType } from '../../types/result';

import type { Swimmer } from '../../model/swimmer';
import { formatRuDate } from '../../utils/formatRuDate';
import { ResultBadge, StagesBadge, stagesCn } from './stages';
import { c } from '../../utils/c';
import { resultPagePath, resultPageUrl } from '../../shared/publicOrigin';
import { useSession } from '../../model/session';
import type { ResultRow } from '../../model/resultRow';

import cn from './useResultsColumns.module.less'
import { distanceName } from '../../shared/format';
import { EquipmentView } from '../../components/equipment/equipmentView';
import { EquipmentPicker } from '../../components/equipment/equipmentPicker';
import { StrokeSelect } from '../../components/stroke/strokeSelect';
import { StrokeView } from '../../components/stroke/strokeView';

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

const renderStages = (_: never, result: ResultRow) => (
  <div className={cn.results} style={{minWidth: Math.floor(result.results.reduce((sum, cur) => sum += (cur.stages.length || 1),0) / 3) * 56 - 1 }}>
    {
      result.results.map((result) => <StagesBadge key={result.id} result={result} />)
    }
  </div>
);

async function copyResultLink(resultId: number) {
  await navigator.clipboard.writeText(resultPageUrl(resultId));
  notification.success({
    message: 'Ссылка скопирована',
    placement: 'bottomRight',
  });
}

/** Мин. ширина таблицы до горизонтального скролла (фикс. колонки + минимум под разбивку). */
function resultsTableScrollX(kind: "swimmer" | "day"): number {
  return kind === "day" ? 800 : 700;
}

const ResultDateCell: FC<{ result: ResultRow }> = observer(({ result }) => {
  const session = useSession();
  const [saving, setSaving] = useState(false);

  if (!session.isTrainer) {
    return formatRuDate(result.date) ?? '—';
  }

  const onChange = async (value: Dayjs | null) => {
    if (!value) return;
    setSaving(true);
    try {
      await result.setDate(value);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DatePicker
      size="small"
      format="DD.MM.YYYY"
      allowClear={false}
      disabled={saving}
      value={result.date.isValid() ? result.date : dayjs()}
      onChange={(d) => void onChange(d)}
    />
  );
});

const ResultEquipmentCell: FC<{ row: ResultRow }> = observer(({ row }) => {
  const session = useSession();
  return session.isTrainer
    ? <EquipmentPicker onChange={row.updateEquipment} value={row.equipment} />
    : <EquipmentView {...row.equipment} />;
});

function useResultsColumns(kind: 'swimmer' | 'day'): ColumnsType<ResultRow> {
  const navigate = useNavigate();
  const session = useSession();
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
      width: 140,
      render: (_: never, result: ResultRow) => (
        <div className={cn.resultCell}>
          {session.isTrainer && <StrokeSelect onChange={result.updateStroke} value={result.stroke} />}
          <div className={cn.resultStroke}>
            {!session.isTrainer && <StrokeView className={cn.stroke} stroke={result.stroke} />}
            {result.isSeries && (<p className={cn.distanceLabel}>{result.results.length}x{distanceName(result.distance, true)}</p>)}
          </div>
          <ResultBadge result={result} />
        </div>
      ),
    },
    {
      title: 'Разбивка',
      dataIndex: 'stages',
      // Гибкая колонка: забирает остаток ширины — внутри flex может переносить бейджи
      onCell: () => ({ className: stagesCn.stagesCell }),
      render: renderStages,
    },
    ...c(kind === 'swimmer', {
      title: 'Дата',
      dataIndex: 'date',
      width: 140,
      render: (_: never, result: ResultRow) => <ResultDateCell result={result} />,
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
      render: (v: ResultCondition | 'open', row) => (
        <div className={cn.kind}>
          <p>{CONDITION_LABEL[v]}</p>
          <div><ResultEquipmentCell row={row} /></div>
        </div>
      ),
    },
    {
      title: 'Поделиться',
      key: 'share',
      width: 180,
      render: (_: never, result: ResultRow) => (
        <Space size={0}>
          <Tooltip title="Скопировать ссылку">
            <Button
              icon={<ShareAltOutlined />}
              onClick={() => void copyResultLink(result.id)}
            />
          </Tooltip>
          <Tooltip title="Скопировать в виде картинки">
            <Button
              icon={<FileImageOutlined />}
              onClick={() => void copyResultLink(result.id)}
            />
          </Tooltip>
          <Tooltip title="Открыть отдельно">
            <Button
              icon={<ExportOutlined />} 
              onClick={() => navigate(resultPageUrl(result.id))}
            />
          </Tooltip>
        </Space>
      ),
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
