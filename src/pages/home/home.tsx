import { observer } from 'mobx-react';
import { Table, Spin } from 'antd';
import { useColumns } from './useColumns';
import { useResults } from '../../model/results';

const Home = observer(() => {
  const columns = useColumns();
  const results = useResults();

  if (results.isLoading)

  return (
    <Spin spinning={results.isLoading.get()}>
      <Table columns={columns} dataSource={results.swimmers} />
    </Spin>
  );
});

export { Home };
