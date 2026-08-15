import { useState } from 'react';
import { Input, Radio, Select, Button, Space, Typography, Alert, DatePicker } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useNavigate } from 'react-router';
import { useResults } from '../../model/results';
import { AsyncButton } from '../../components/asyncButton';
import type { Sex } from '../../types/swimmer';

import cn from './addSwimmer.module.less';
import { observer } from 'mobx-react';
import { PlusCircleOutlined } from '@ant-design/icons';

const AddSwimmer = observer(() => {
  const navigate = useNavigate();
  const results = useResults();

  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [teamIds, setTeamIds] = useState<number[]>([]);
  const [birthDate, setBirthDate] = useState<Dayjs>(() => dayjs('1990-01-01'));
  const [error, setError] = useState<string | null>(null);

  const valid = Boolean(name.trim() && teamIds.length > 0);

  const handleSave = async () => {
    if (!valid) return;
    try {
      const swimmer = await results.addSwimmer({
        name: name.trim(),
        sex,
        teamIds,
        birthDate: birthDate.format('YYYY-MM-DD'),
      });
      navigate(`/${swimmer.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (error) {
    return (
      <div className={cn.page}>
        <Alert type="error" title={error} />
        <Button type="link" onClick={() => setError(null)} style={{ padding: 0 }}>
          Закрыть
        </Button>
      </div>
    );
  }

  return (
    <div className={cn.page}>
      <Typography.Title level={3}>Добавить пловца</Typography.Title>

      <Input
        className={cn.field}
        placeholder="Имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Radio.Group
        className={cn.field}
        value={sex}
        onChange={(e) => setSex(e.target.value)}
        options={[
          { value: 'male', label: 'мужской' },
          { value: 'female', label: 'женский' },
        ]}
      />
      <Select
        className={cn.field}
        mode="multiple"
        showSearch
        allowClear
        placeholder="Группы"
        optionFilterProp="label"
        value={teamIds}
        onChange={(ids) => setTeamIds(ids)}
        options={results.teamsSelect}
        popupRender={(menu) => (
          <>
            {menu}
            <Button className={cn.dropdownAction} type="text" icon={<PlusCircleOutlined />} onClick={() => navigate('/teams/add')}>
              Создать группу
            </Button>
          </>
        )}
      />
      <DatePicker
        className={cn.field}
        format="DD.MM.YYYY"
        placeholder="Дата рождения"
        value={birthDate}
        onChange={(d) => d && setBirthDate(d)}
        disabledDate={(d) => d.isAfter(dayjs(), 'day')}
      />

      <Space>
        <Button onClick={() => navigate('/')}>Отмена</Button>
        <AsyncButton type="primary" disabled={!valid} onClick={handleSave}>
          Сохранить
        </AsyncButton>
      </Space>
    </div>
  );
});

export { AddSwimmer };
