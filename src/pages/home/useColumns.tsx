import type { ColumnsType } from "antd/es/table";
import { Tooltip } from "antd";
import { useResults } from "../../model/results";
import { useMemo } from "react";

const useColumns = (): ColumnsType<any> => {
  const results = useResults();
  return useMemo(() => [
    {
      title: 'Пловец',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '',
      dataIndex: 'sexEmoji',
      key: 'sexEmoji',
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
    ...results.distances.map(distance => ({
      title: distance,
      dataIndex: distance,
      key: distance,
    }))
  ], [results.isLoading]);
};

export { useColumns };
