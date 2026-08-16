import type { ReactNode } from "react";
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import { Session, SessionProvider } from "./model/session";
import { Results, ResultsProvider } from "./model/results";
import { useModel } from "./utils/useModel";

const AppProviders = ({ children }: { children: ReactNode }) => {
  const session = useModel(() => new Session());
  const results = useModel(() => new Results());

  return (
    <ConfigProvider locale={ruRU}>
      <SessionProvider value={session}>
        <ResultsProvider value={results}>{children}</ResultsProvider>
      </SessionProvider>
    </ConfigProvider>
  );
};

export { AppProviders };
