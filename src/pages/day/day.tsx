import { Button, Table, Typography } from 'antd';
import { Link } from 'react-router';
import { observer } from 'mobx-react';
import dayjs from 'dayjs';
import { useDay } from '../../router/dayOutline';
import { useResults } from '../../model/results';
import { formatRuDate } from '../../utils/formatRuDate';
import { useResultsColumns } from '../results/useResultsColumns';

import cn from './day.module.less';

const Day = observer(() => {
  const day = useDay();
  const results = useResults();
  const columns = useResultsColumns('day');

  const rows = results.results.filter((r) => r.date.isValid() && r.date.format('YYYY-MM-DD') === day).sort((a, b) => a.date.valueOf() - b.date.valueOf());

  const titleDate = dayjs(day);

  return (
    <div className={cn.page}>
      <Button type="link" className={cn.back}>
        <Link to="/">← Назад</Link>
      </Button>
      <Typography.Title level={3}>
        Результаты за {titleDate.isValid() ? formatRuDate(titleDate) : day}
      </Typography.Title>
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

export { Day };
