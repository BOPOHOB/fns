import { Switch, Select, Radio, Slider, Button, Space, Typography } from 'antd';
import { ClearOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react';
import { useFilters, type FilterState } from './useFilters';
import { DISTANCE_CATEGORY_OPTIONS } from '../../shared/distances';
import { useResults } from '../../model/results';

import cn from './filters.module.less';

const FiltersBar = observer(() => {
  const results = useResults();
  const { filters, setFilters, clearFilters, filtersAreDefault } = useFilters();

  const update = (patch: Partial<FilterState>) => setFilters({ ...filters, ...patch });

  return (
    <Space wrap size={[12, 12]} className={cn.bar}>
      <Switch
        checked={!filters.bestOnly}
        onChange={(checked) => update({ bestOnly: !checked })}
        checkedChildren="Все"
        unCheckedChildren="Лучший"
      />

      <Select
        mode="multiple"
        allowClear
        placeholder="Тип бассейна"
        className={cn.pool}
        options={DISTANCE_CATEGORY_OPTIONS}
        value={filters.distances}
        onChange={(distances) => update({ distances })}
      />

      <Select
        mode="multiple"
        allowClear
        showSearch
        optionFilterProp="label"
        placeholder="Группа"
        className={cn.group}
        options={results.teamsSelect}
        value={filters.groups}
        onChange={(groups) => update({ groups })}
      />

      <Radio.Group
        optionType="button"
        value={filters.sex}
        onChange={(e) => update({ sex: e.target.value })}
        options={[
          { value: 'all', label: 'Все' },
          { value: 'male', label: 'Мужчины' },
          { value: 'female', label: 'Женщины' },
        ]}
      />

      <div className={cn.ageContainer}>
        <Typography.Text>Возраст</Typography.Text>
        <Slider
          range
          min={10}
          max={90}
          value={[filters.ageMin, filters.ageMax]}
          onChange={([ageMin, ageMax]) => update({ ageMin, ageMax })}
          className={cn.age}
        />
      </div>
      <Typography.Text type="secondary">
        {filters.ageMin}–{filters.ageMax}
      </Typography.Text>
      {!filtersAreDefault && (
        <Button size="small" onClick={clearFilters} icon={<ClearOutlined />} />
      )}
    </Space>
  );
});

export { FiltersBar };
