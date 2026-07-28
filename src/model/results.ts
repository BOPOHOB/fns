import { computed, makeObservable, observable, runInAction, transaction } from "mobx";
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
  isLoading = true;

  constructor() {
    getResults().then(({
      results,
      swimmers,
      series,
      teams,
    }) => runInAction(() => transaction(() => {
      this.isLoading = false;
      this.results.replace(results.map((json) => new Result(json, this)));
      this.swimmers.replace(swimmers.map((json) => new Swimmer(json, this)));
      this.series.replace(series.map((json) => new ResultSeries(json, this)));
      this.teams.replace(teams.map((json) => new Team(json, this)));
    })));

    makeObservable(this, {
      isLoading: observable,
      swimmersMap: computed,
      lader: computed,
    });
  }

  get swimmersMap() {
    return new Map(this.swimmers.map((swimmer) => [swimmer.id, swimmer]));
  } 

  get lader() {
    return this.results.slice().sort((a, b) => a.result - b.result).map(result => result.swimmer);
  }

  get distances() {
    const set = new Set(this.results.map((result) => result.distance));
    return [...set.values()].sort();
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
