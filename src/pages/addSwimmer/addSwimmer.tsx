import { useMemo, useState } from 'react';
import { Input, Radio, Select, Button, Space, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router';
import { useResults } from '../../model/results';
import { AsyncButton } from '../../components/asyncButton';
import type { Sex } from '../../types/swimmer';

import cn from './addSwimmer.module.less';
import { observer } from 'mobx-react';
import { PlusCircleOutlined } from '@ant-design/icons';

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'][i],
}));

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function BirthSelectors({
  day,
  month,
  year,
  onChange,
}: {
  day: number;
  month: number;
  year: number;
  onChange: (d: number, m: number, y: number) => void;
}) {
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 90 }, (_, i) => now - 10 - i);
  }, []);

  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth(month, year) }, (_, i) => ({
        value: i + 1,
        label: String(i + 1).padStart(2, '0'),
      })),
    [month, year],
  );

  return (
    <Space wrap>
      <Select
        style={{ width: 90 }}
        value={day}
        options={days}
        onChange={(d) => onChange(d, month, year)}
      />
      <Select
        style={{ width: 120 }}
        value={month}
        options={MONTHS}
        onChange={(m) => {
          const maxDay = daysInMonth(m, year);
          onChange(Math.min(day, maxDay), m, year);
        }}
      />
      <Select
        style={{ width: 100 }}
        value={year}
        options={years.map((y) => ({ value: y, label: String(y) }))}
        onChange={(y) => {
          const maxDay = daysInMonth(month, y);
          onChange(Math.min(day, maxDay), month, y);
        }}
      />
    </Space>
  );
}

function toBirthDate(day: number, month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const AddSwimmer = observer(() => {
  const navigate = useNavigate();
  const results = useResults();

  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [teamIds, setTeamIds] = useState<number[]>([]);
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState(1);
  const [year, setYear] = useState(1990);
  const [error, setError] = useState<string | null>(null);

  const valid = Boolean(name.trim() && teamIds.length > 0);

  const handleSave = async () => {
    if (!valid) return;
    try {
      const swimmer = await results.addSwimmer({
        name: name.trim(),
        sex,
        teamIds,
        birthDate: toBirthDate(day, month, year),
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
      <BirthSelectors
        day={day}
        month={month}
        year={year}
        onChange={(d, m, y) => {
          setDay(d);
          setMonth(m);
          setYear(y);
        }}
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
