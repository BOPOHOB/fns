import { Button, Table, Typography } from 'antd';
import { Link } from 'react-router';
import { observer } from 'mobx-react';
import { useSwimmer } from '../../router/swimmerOutline';
import { useResults } from '../../model/results';
import { PlusOutlined } from '@ant-design/icons';
import { useResultsColumns } from '../results/useResultsColumns';

import cn from './swimmer.module.less';

const Swimmer = observer(() => {
  const swimmer = useSwimmer();
  const results = useResults();
  const columns = useResultsColumns('swimmer');

  const teamNames = swimmer.teamIds
    .map((id) => results.teams.find((t) => t.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  const rows = swimmer.results.sort((a, b) => b.date.valueOf() - a.date.valueOf());

  return (
    <div className={cn.page}>
      <Button type="link" className={cn.back}>
        <Link to="/">← Назад</Link>
      </Button>
      <Button icon={<PlusOutlined />} type="link" className={cn.back}>
        <Link to="add">Добавить результат</Link>
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
