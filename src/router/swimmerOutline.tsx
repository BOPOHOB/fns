import { createContext, useContext } from "react";
import { Link, Outlet, useParams } from "react-router";
import type { Swimmer } from "../model/swimmer";
import { useResults } from "../model/results";
import { observer } from "mobx-react";
import { Alert, Spin } from "antd";

const SWIMMER_CONTEXT = createContext<Swimmer | null>(null);

const useSwimmer = () => {
  const ctx = useContext(SWIMMER_CONTEXT);
  if (!ctx) throw new Error('useSwimmer must be used inside swimmer route');
  return ctx;
};

const SwimmerOutline = observer(() => {
  const results = useResults();
  const { segment } = useParams<{ segment: string }>();
  const swimmer = results.swimmersMap.get(Number(segment));

  if (results.isLoading) {
    return <Spin />;
  }

  if (swimmer === undefined) {
    return (
      <Alert style={{margin: 30}} showIcon type="warning"
        title={`Пловец с идентификатором ${segment} не найден`}
        description={<Link to="/">Вернуться к таблице результатов</Link>}
      />
    );
  }
  return (
    <SWIMMER_CONTEXT.Provider value={swimmer}>
      <Outlet />
    </SWIMMER_CONTEXT.Provider>
  );
});

export { SwimmerOutline, useSwimmer };
