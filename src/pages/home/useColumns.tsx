import type { ColumnsType } from "antd/es/table";
import { Button, Tooltip } from "antd";
import { useResults } from "../../model/results";
import { useMemo, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import type { Swimmer } from "../../model/swimmer";
import { useSession } from "../../model/session";
import { PlusOutlined } from "@ant-design/icons";
import { useFilters } from "./useFilters";
import { distancesForCategories } from "../../shared/distances";
import { distanceName } from "../addResult/distanceSelect";

import cn from './columns.module.less';
import type { Result } from "../../model/result";
import type { ResultCondition } from "../../types/result";
import { stringifySeconds } from "../../utils/stringifySeconds";
import { formatRuDate } from "../../utils/formatRuDate";
import clsx from "clsx";

const CONDITION_TOOL_TIP = {
  competition: 'соревнованиях',
  test: 'контрольном заплыве',
  workout: 'тренировке',
  open: 'открытой воде'
}

const conditionTooltip = (condition: ResultCondition | 'open'): string | undefined => {
  return condition !== 'workout' ? `результат зафиксирован на ${CONDITION_TOOL_TIP[condition]}` : undefined;
}

function renderResult(entry: Result, markers: ReactNode[]) {
  const time = stringifySeconds(entry.result);
  const condition = entry.condition;
  const timeClassName = cn[condition];
  return (
    <>
      <Tooltip
        title={
          [
            entry.date
              ? `Установлен ${formatRuDate(entry.date)} года`
              : 'Дата фиксации результата не указана'
            ,
            conditionTooltip(condition),
            entry.fifty && 'результат показан в 50м бассейне'
          ].filter(Boolean).join(', ')
        }
      >
        <span className={clsx(timeClassName, entry.fifty && cn.fifty)}>{time}</span>
      </Tooltip>
      {markers}
    </>
  );
}

const useColumns = (): ColumnsType<Swimmer["row"]> => {
  const results = useResults();
  const session = useSession();
  const navigate = useNavigate();
  const { filters } = useFilters();
  const visibleDistances = distancesForCategories(filters.distances, results.distances);

  return useMemo(() => [
    {
      title: 'Пловец',
      dataIndex: 'name',
      key: 'name',
      className: cn.name,
      width: 200,
      render: (name, swimmer) => [
        <Link className={cn.text} key="name" to={`/${swimmer.id}`}>{name}</Link>,
        session.isTrainer && (
          <Button className={cn.add} size="small" key="add" onClick={() => navigate(`/${swimmer.id}/add`)} icon={<PlusOutlined />} />
        )
      ],
    },
    {
      title: '',
      dataIndex: 'sexEmoji',
      key: 'sexEmoji',
      width: 20,
      render: (sexEmoji, swimmer) => {
        const tooltip = swimmer.sexTooltip;
        if (tooltip) {
          return sexEmoji;
        }
        return <Tooltip title={tooltip}>{sexEmoji}</Tooltip>
      }
    },
    {
      title: 'Возраст',
      dataIndex: 'age',
      key: 'age',
    },
    ...visibleDistances.map(distance => ({
      title: distanceName(distance, true),
      dataIndex: distance,
      key: distance,
      render: (cellResults: Result[] | undefined) => {
        return cellResults?.map((e, i) => (
          <div key={e.id}>{renderResult(e, [])}</div>
        )) ?? '—';
      }
    }))
  ], [visibleDistances.join(','), results.isLoading, session.isTrainer, navigate]);
};

export { useColumns };
