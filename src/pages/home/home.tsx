import { observer } from 'mobx-react';
import { Table, Spin } from 'antd';
import { useColumns } from './useColumns';
import { useResults } from '../../model/results';
import { FiltersBar } from './filters';
import { useFilters } from './useFilters';
import {
  distancesForCategories,
  resultMatchesDistanceCategories,
  type DistanceCategory,
} from '../../shared/distances';
import type { Result } from '../../model/result';
import type { Swimmer } from '../../model/swimmer';

import cn from './home.module.less';

function bestResult(list: Result[]): Result | undefined {
  if (!list.length) return undefined;
  return list.reduce((a, b) => (a.result < b.result ? a : b));
}

function buildRow(
  swimmer: Swimmer,
  visibleDistances: number[],
  bestOnly: boolean,
  distanceCategories: DistanceCategory[],
): Swimmer['row'] {
  const base = swimmer.row;
  const row: Swimmer['row'] = {
    key: base.key,
    id: base.id,
    name: base.name,
    sexTooltip: base.sexTooltip,
    sexEmoji: base.sexEmoji,
    age: base.age,
  };

  for (const distance of visibleDistances) {
    let list = swimmer.results.filter(
      (r) =>
        r.distance === distance &&
        resultMatchesDistanceCategories(r.water, distanceCategories),
    );
    if (bestOnly) {
      const best = bestResult(list);
      list = best ? [best] : [];
    }
    row[distance] = list;
  }

  return row;
}

const Home = observer(() => {
  const columns = useColumns();
  const results = useResults();
  const { filters } = useFilters();

  const visibleDistances = distancesForCategories(filters.distances, results.distances);

  const rows = results.swimmers
    .filter((s) => {
      if (filters.sex !== 'all' && s.sex !== filters.sex) return false;
      if (
        s.age !== undefined &&
        (s.age < filters.ageMin || s.age > filters.ageMax)
      ) {
        return false;
      }
      if (
        filters.groups.length &&
        !filters.groups.some((id) => s.teamIds.includes(id))
      ) {
        return false;
      }
      return true;
    })
    .map((s) => buildRow(s, visibleDistances, filters.bestOnly, filters.distances));

  return (
    <div className={cn.page}>
      <FiltersBar />
      <Spin spinning={results.isLoading}>
        <Table columns={columns} dataSource={rows} pagination={false} scroll={{ x: 'max-content' }} />
      </Spin>
    </div>
  );
});

export { Home };
