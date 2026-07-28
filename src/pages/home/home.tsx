import { observer } from 'mobx-react';
import { Table, Spin } from 'antd';
import { useColumns } from './useColumns';
import { useResults } from '../../model/results';

const Home = observer(() => {
  const columns = useColumns();
  const results = useResults();
  const rows = results.swimmers.map((swimmer) => swimmer.row);

  return (
    <Spin spinning={results.isLoading}>
      <Table columns={columns} dataSource={rows} />
    </Spin>
  );
});

export { Home };
