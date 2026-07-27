import { observable, runInAction, transaction } from "mobx";
import { Result } from './result';
import { Swimmer } from './swimmer';
import { ResultSeries } from './resultSeries';
import { Team } from './team';
import { createContext, useContext } from "react";
import { getResults } from "../api/results";

class Results {
  results = observable.array<Result>();
  swimmers = observable.array<Swimmer>();
  series = observable.array<ResultSeries>();
  teams = observable.array<Team>();
  isLoading = observable.box(true);

  constructor() {
    getResults().then(({
      results,
      swimmers,
      series,
      teams,
    }) => runInAction(() => transaction(() => {
      this.isLoading.set(false);
      this.results.replace(results.map((json) => new Result(json, this)));
      this.swimmers.replace(swimmers.map((json) => new Swimmer(json, this)));
      this.series.replace(series.map((json) => new ResultSeries(json, this)));
      this.teams.replace(teams.map((json) => new Team(json, this)));
    })));
  }
}

const ResultsContext = createContext<Results | null>(null);
const ResultsProvider = ResultsContext.Provider;

function useResults() {
  const ctx = useContext(ResultsContext);
  if (!ctx) throw new Error('useResults must be used inside ResultsProvider');
  return ctx;
}

export { Results, ResultsProvider, useResults };
