import { createContext, useContext } from "react";
import { Link, Outlet, useParams } from "react-router";
import { observer } from "mobx-react";
import { Alert, Spin } from "antd";
import type { Result } from "../model/result";
import { useResults } from "../model/results";

const RESULT_CONTEXT = createContext<Result | null>(null);

const useResult = () => {
  const ctx = useContext(RESULT_CONTEXT);
  if (!ctx) throw new Error("useResult must be used inside result route");
  return ctx;
};

const ResultOutline = observer(() => {
  const results = useResults();
  const { resultId } = useParams<{ resultId: string }>();

  if (results.isLoading) {
    return <Spin />;
  }

  const id = Number(resultId);
  const result = results.results.find((r) => r.id === id);

  if (!Number.isInteger(id) || id < 1 || result === undefined) {
    return (
      <Alert
        style={{ margin: 30 }}
        showIcon
        type="warning"
        title={`Результат с идентификатором ${resultId} не найден`}
        description={<Link to="/">Назад</Link>}
      />
    );
  }

  return (
    <RESULT_CONTEXT.Provider value={result}>
      <Outlet />
    </RESULT_CONTEXT.Provider>
  );
});

export { ResultOutline, useResult };
