import { Button, DatePicker, Input, Space, Table, Typography } from 'antd';
import { Link } from 'react-router';
import { observer } from 'mobx-react';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useSwimmer } from '../../router/swimmerOutline';
import { useResults } from '../../model/results';
import { useSession } from '../../model/session';
import { PlusOutlined } from '@ant-design/icons';
import { useResultsColumns } from '../results/useResultsColumns';

import cn from './swimmer.module.less';

const NAME_SAVE_DEBOUNCE_MS = 2000;

const Swimmer = observer(() => {
  const swimmer = useSwimmer();
  const results = useResults();
  const session = useSession();
  const columns = useResultsColumns('swimmer');
  const [savingBirthDate, setSavingBirthDate] = useState(false);
  const [nameDraft, setNameDraft] = useState(swimmer.name);

  useEffect(() => {
    setNameDraft(swimmer.name);
  }, [swimmer.id, swimmer.name]);

  useEffect(() => {
    if (!session.isTrainer) return;
    const trimmed = nameDraft.trim();
    if (!trimmed || trimmed === swimmer.name) return;

    const timer = window.setTimeout(() => {
      void results.setSwimmerName(swimmer.id, trimmed);
    }, NAME_SAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [nameDraft, results, session.isTrainer, swimmer.id, swimmer.name]);

  const teamNames = swimmer.teamIds
    .map((id) => results.teams.find((t) => t.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  const rows = swimmer.results.sort((a, b) => b.date.valueOf() - a.date.valueOf());

  const meta = [
    teamNames || null,
    swimmer.sex === 'male' ? 'мужской' : 'женский',
    swimmer.age !== undefined ? `${swimmer.age} лет` : null,
  ].filter(Boolean);

  const onBirthDateChange = async (value: Dayjs | null) => {
    setSavingBirthDate(true);
    try {
      await results.setSwimmerBirthDate(
        swimmer.id,
        value ? value.format('YYYY-MM-DD') : null,
      );
    } finally {
      setSavingBirthDate(false);
    }
  };

  return (
    <div className={cn.page}>
      <Button type="link" className={cn.back}>
        <Link to="/">← Назад</Link>
      </Button>
      <Button icon={<PlusOutlined />} type="link" className={cn.back}>
        <Link to="add">Добавить результат</Link>
      </Button>
      {session.isTrainer ? (
        <Input
          className={cn.name}
          value={nameDraft}
          onChange={(e) => setNameDraft(e.target.value)}
          placeholder="Имя"
        />
      ) : (
        <Typography.Title level={3}>{swimmer.name}</Typography.Title>
      )}
      <Typography.Paragraph type="secondary">
        <Space wrap size="small">
          {meta.length > 0 && <span>{meta.join(' · ')}</span>}
          {session.isTrainer ? (
            <DatePicker
              size="small"
              format="DD.MM.YYYY"
              placeholder="Дата рождения"
              allowClear
              disabled={savingBirthDate}
              value={swimmer.birthDate ? dayjs(swimmer.birthDate, 'YYYY-MM-DD') : null}
              onChange={(d) => void onBirthDateChange(d)}
              disabledDate={(d) => d.isAfter(dayjs(), 'day')}
            />
          ) : (
            swimmer.birthDate && <span>{swimmer.birthDate}</span>
          )}
        </Space>
      </Typography.Paragraph>
      <Table
        size="small"
        pagination={false}
        columns={columns}
        dataSource={rows}
        locale={{ emptyText: 'Нет результатов' }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
});

export { Swimmer };
