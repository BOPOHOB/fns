import type { Result } from "../types/result";
import type { ResultSeries } from "../types/resultSeries";
import type { Swimmer } from "../types/swimmer";
import type { Team } from "../types/team";
import { apiFetch } from "./client";

const getResults = () => Promise.all([
  apiFetch<Swimmer[]>('/api/swimmers'),
  apiFetch<Team[]>('/api/teams'),
  apiFetch<Result[]>('/api/results'),
  apiFetch<ResultSeries[]>('/api/series'),
]).then(([swimmers,
  teams,
  results,
  series]) => ({swimmers,
    teams,
    results,
    series}));

export { getResults };
