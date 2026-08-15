import { observer } from 'mobx-react';
import { Button, Popconfirm, Spin, Table, Tooltip } from 'antd';
import { useNavigate } from 'react-router';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useResults } from '../../model/results';
import type { ColumnsType } from 'antd/es/table';
import { AsyncSelect } from '../../components/asyncSelect';

import cn from './teams.module.less';

type Row = {
  key: number;
  id: number;
  name: string;
  trainerId: number | null;
  slots: string[];
  memberIds: number[];
};

const Teams = observer(() => {
  const results = useResults();
  const navigate = useNavigate();
  const rows = results.teams.map((t) => t.row);

  const columns: ColumnsType<Row> = [
    {
      title: 'Тренер',
      dataIndex: 'trainerId',
      key: 'trainer',
      width: 220,
      render: (trainerId: number | null, row) => (
        <AsyncSelect<number>
          className={cn.trainer}
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Тренер"
          value={trainerId ?? undefined}
          options={results.trainersSelect}
          onChange={(id) => results.setTeamTrainer(row.id, id ?? null)}
        />
      ),
    },
    {
      title: 'Слоты',
      dataIndex: 'slots',
      key: 'slots',
      render: (slots: string[]) =>
        slots.length ? (
          <ul className={cn.slots}>
            {slots.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : (
          '—'
        ),
    },
    {
      title: 'Участники',
      dataIndex: 'memberIds',
      key: 'members',
      width: 320,
      render: (memberIds: number[], row) => (
        <AsyncSelect<number[]>
          className={cn.members}
          mode="multiple"
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Пловцы"
          value={memberIds}
          options={results.swimmersSelect}
          onChange={(ids) => results.setTeamMembers(row.id, ids ?? [])}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 56,
      render: (_, row) => (
        <Tooltip title={"После удаления информация о пловцах не будет потеряна, они просто \"выйдут\" из удалённой группы"}>
          <Popconfirm
            title="Не случайно нажал?"
            okText="Удалить"
            cancelText="Отмена"
            placement='bottom'
            okButtonProps={{ danger: true }}
            onConfirm={() => results.deleteTeam(row.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className={cn.page}>
      <div className={cn.head}>
        <h2>Группы</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/teams/add')}>
          Добавить
        </Button>
      </div>
      <Spin spinning={results.isLoading}>
        <Table columns={columns} dataSource={rows} pagination={false} scroll={{ x: 'max-content' }} />
      </Spin>
    </div>
  );
});

export { Teams };
