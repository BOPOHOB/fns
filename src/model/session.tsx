import { observable } from "mobx";
import type { Result } from "./result";
import type { Swimmer } from "./swimmer";
import type { ResultSeries } from "./resultSeries";
import type { Team } from "./team";
import { createContext, useContext } from "react";

const getData = () => Promise.resolve();

class Session {
  results = observable.array<Result>();
  swimmers = observable.array<Swimmer>();
  series = observable.array<ResultSeries>();
  teams = observable.array<Team>();
  #isLoading = observable.box<boolean>(true);

  constructor() {
    getData().then(() => {}).finally(() => {
      this.#isLoading.set(false);
    });
  }

  get isLoading() {
    return this.#isLoading.get();
  }
};

const SessionContext = createContext<Session | null>(null);
const SessionProvider = SessionContext.Provider;
const useSession = () => useContext(SessionContext);

export { SessionProvider, useSession, Session };
