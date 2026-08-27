import { observer } from 'mobx-react';
import { Button, Popconfirm, Spin, Tooltip } from 'antd';
import { useNavigate } from 'react-router';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useResults } from '../../model/results';
import type { Team } from '../../model/team';
import type { ColumnsType } from 'antd/es/table';
import { AsyncSelect } from '../../components/asyncSelect';

import cn from './teams.module.less';
import { CommonTable } from '../../components/commonTable';

const Teams = observer(() => {
  const results = useResults();
  const navigate = useNavigate();

  const columns: ColumnsType<Team> = [
    {
      title: 'Тренер',
      dataIndex: 'trainerId',
      key: 'trainer',
      width: 220,
      render: (trainerId: number | null, team) => (
        <AsyncSelect<number>
          className={cn.trainer}
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Тренер"
          value={trainerId ?? undefined}
          options={results.trainersSelect}
          onChange={(id) => team.setTrainer(id ?? null)}
        />
      ),
    },
    {
      title: 'Слоты',
      key: 'slots',
      render: (_, team) =>
        team.slotsLabel.length ? (
          <ul className={cn.slots}>
            {team.slotsLabel.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        ) : (
          '—'
        ),
    },
    {
      title: 'Участники',
      key: 'members',
      width: 320,
      render: (_, team) => (
        <AsyncSelect<number[]>
          className={cn.members}
          mode="multiple"
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Пловцы"
          value={team.members.map((s) => s.id)}
          options={results.swimmersSelect}
          onChange={(ids) => team.setMembers(ids ?? [])}
        />
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 56,
      render: (_, team) => (
        <Tooltip title={"После удаления информация о пловцах не будет потеряна, они просто \"выйдут\" из удалённой группы"}>
          <Popconfirm
            title="Не случайно нажал?"
            okText="Удалить"
            cancelText="Отмена"
            placement='bottom'
            okButtonProps={{ danger: true }}
            onConfirm={() => results.deleteTeam(team.id)}
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
        <CommonTable columns={columns} dataSource={results.teams} />
      </Spin>
    </div>
  );
});

export { Teams };
