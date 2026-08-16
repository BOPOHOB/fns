import { Button, Typography } from "antd";
import { Link } from "react-router";
import { observer } from "mobx-react";
import { useResult } from "../../router/resultOutline";
import { useResultsColumns } from "../results/useResultsColumns";
import { CommonTable } from "../../components/commonTable";
import { formatRuDate } from "../../utils/formatRuDate";
import { stringifySeconds } from "../../utils/stringifySeconds";

import cn from "./result.module.less";

const ResultPage = observer(() => {
  const result = useResult();
  const columns = useResultsColumns("swimmer");
  const series = result.series;
  const rows = series ? series.results : [result];

  const title = series
    ? `Серия · ${result.distanceName}`
    : `${result.distanceName} · ${stringifySeconds(result.result)}`;

  const subtitle = [
    result.swimmer?.name,
    formatRuDate(result.date),
    series
      ? `${series.repetitions} повт.${series.regime != null ? ` · интервал ${stringifySeconds(series.regime)}` : ""}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={cn.page}>
      <Button type="link" className={cn.back}>
        <Link to={`/${result.swimmerId}`}>← К пловцу</Link>
      </Button>
      <Typography.Title level={3}>{title}</Typography.Title>
      <Typography.Paragraph type="secondary">{subtitle}</Typography.Paragraph>
      <CommonTable columns={columns} dataSource={rows} rowKey="id" />
    </div>
  );
});

export { ResultPage };
