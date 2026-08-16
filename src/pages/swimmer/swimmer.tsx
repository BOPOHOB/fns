import { Button, DatePicker, Space, Typography } from 'antd';
import { Link } from 'react-router';
import { observer } from 'mobx-react';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import { useSwimmer } from '../../router/swimmerOutline';
import { useResults } from '../../model/results';
import { useSession } from '../../model/session';
import { PlusOutlined } from '@ant-design/icons';
import { useResultsColumns, resultsTableScrollX } from '../results/useResultsColumns';
import { AsyncInput } from '../../components/asyncInput';
import { CommonTable } from '../../components/commonTable';

import cn from './swimmer.module.less';

const NAME_SAVE_DEBOUNCE_MS = 2000;

const Swimmer = observer(() => {
  const swimmer = useSwimmer();
  const results = useResults();
  const session = useSession();
  const columns = useResultsColumns('swimmer');
  const [savingBirthDate, setSavingBirthDate] = useState(false);

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
        <AsyncInput
          className={cn.name}
          value={swimmer.name}
          debounceMs={NAME_SAVE_DEBOUNCE_MS}
          placeholder="Имя"
          onChange={(name) => results.setSwimmerName(swimmer.id, name)}
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
      <CommonTable columns={columns} dataSource={rows} scroll={{ x: resultsTableScrollX('swimmer') }} />
    </div>
  );
});

export { Swimmer };
