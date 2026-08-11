import { useState } from 'react';
import { Alert, Button, Input, Select, Space, Tooltip, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useNavigate } from 'react-router';
import { observer } from 'mobx-react';
import { useResults } from '../../model/results';
import { AsyncButton } from '../../components/asyncButton';
import { SlotsEditor } from './slotsEditor';

import cn from './addTeam.module.less';

const AddTeam = observer(() => {
  const navigate = useNavigate();
  const results = useResults();

  const [name, setName] = useState('');
  const [trainerId, setTrainerId] = useState<number | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const errorMessage = (() => {
    if (trainerId === null) return 'Выберите тренера';
    if (slots.length === 0) return 'Добавьте хотя бы один слот';
    return null;
  })();

  const handleSave = async () => {
    if (errorMessage) return;
    try {
      await results.addTeam({
        name: name.trim(),
        trainerId,
        slots,
        notes,
      });
      navigate('/teams');
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
      <Typography.Title level={3}>Добавить группу</Typography.Title>

      <Input
        className={cn.field}
        placeholder="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Select
        className={cn.field}
        allowClear
        showSearch
        optionFilterProp="label"
        placeholder="Тренер"
        value={trainerId ?? undefined}
        onChange={(v) => setTrainerId(v ?? null)}
        options={results.trainersSelect}
      />
      <SlotsEditor value={slots} onChange={setSlots} />
      <TextArea
        className={cn.field}
        rows={4}
        placeholder="Заметки"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />

      <Space>
        <Button onClick={() => navigate('/teams')}>Отмена</Button>
        <Tooltip title={errorMessage}>
          <AsyncButton type="primary" disabled={Boolean(errorMessage)} onClick={handleSave}>
            Сохранить
          </AsyncButton>
        </Tooltip>
      </Space>
    </div>
  );
});

export { AddTeam };
