import { action, computed, makeObservable, observable, runInAction, transaction } from "mobx";
import { Result } from './result';
import { Swimmer } from './swimmer';
import { ResultSeries } from './resultSeries';
import { Team } from './team';
import { createContext, useContext } from "react";
import { getResults, submitResult } from "../api/results";
import { submitSwimmer, type CreateSwimmerBody } from "../api/swimmers";
import { submitTeam, deleteTeam, type CreateTeamBody } from "../api/teams";

class Results {
  results = observable.array<Result>();
  swimmers = observable.array<Swimmer>();
  series = observable.array<ResultSeries>();
  teams = observable.array<Team>();
  isLoading = true;

  constructor() {
    if (!import.meta.env.SSR) {
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
    }

    makeObservable(this, {
      isLoading: observable,
      swimmersMap: computed,
      lader: computed,
      addResult: action,
      addSwimmer: action,
      addTeam: action,
      deleteTeam: action,
      distances: computed,
      summaryTableRows: computed,
      teamsSelect: computed,
      trainersSelect: computed,
      swimmersSelect: computed,
    });
  }

  get teamsSelect() {
    return this.teams.map((team) => ({
      label: team.label,
      value: team.id
    }));
  }

  get trainersSelect() {
    return this.swimmers
      .filter((s) => s.role === 'trainer')
      .map((s) => ({ label: s.name, value: s.id }));
  }

  get swimmersSelect() {
    return this.swimmers.map((s) => ({ label: s.name, value: s.id }));
  }

  get days() {
    const set = new Set(this.results.map(result => result.date.format("YYYY-MM-DD")));
    return [...set.values()].sort();
  }

  get swimmersMap() {
    return new Map(this.swimmers.map((swimmer) => [swimmer.id, swimmer]));
  } 

  get lader() {
    return this.results.slice().sort((a, b) => a.result - b.result).map(result => result.swimmer);
  }

  get distances() {
    const set = new Set(this.results.map((result) => result.distance));
    return [...set.values()].sort((a, b) => a - b);
  }

  get summaryTableRows() {
    return this.swimmers.map(({ row }) => row);
  }

  async addResult(data: Parameters<typeof submitResult>[0]) {
    const {results, series} = await submitResult(data);
    runInAction(() => transaction(() => {
      if (series !== null) {
        this.series.push(new ResultSeries(series, this));
      }
      for (const result of results) {
        this.results.push(new Result(result, this));
      }
    }));
  }

  async addSwimmer(data: CreateSwimmerBody) {
    const swimmer = await submitSwimmer(data);
    runInAction(() => {
      this.swimmers.push(new Swimmer(swimmer, this));
    });
    return swimmer;
  }

  async addTeam(data: CreateTeamBody) {
    const team = await submitTeam(data);
    runInAction(() => {
      this.teams.push(new Team(team, this));
    });
    return team;
  }

  async deleteTeam(teamId: number) {
    await deleteTeam(teamId);
    runInAction(() => {
      const index = this.teams.findIndex((t) => t.id === teamId);
      if (index >= 0) this.teams.splice(index, 1);
      for (const swimmer of this.swimmers) {
        if (swimmer.teamIds.includes(teamId)) {
          swimmer.setTeamIds(swimmer.teamIds.filter((id) => id !== teamId));
        }
      }
    });
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
