import type { Result, Stages } from "../types/result";
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

type ResultResponse = { results: Result[], series: ResultSeries | null };

const submitResult = async (result: Omit<Result, 'id' | 'result' | 'stages'> & { result: number[], stages: Stages[] }): Promise<ResultResponse> => {
  if (result.result.length === 1) {
    const response = await apiFetch<Result>('/api/results', {
      method: 'POST',
      body: JSON.stringify({
        ...result,
        result: result.result[0],
        stages: result.stages[0],
      }),
    });
    return {
      series: null,
      results: [response]
    }
  } else {
    return apiFetch<ResultResponse>('/api/series', {
      method: 'POST',
      body: JSON.stringify(result),
    });
  }
}

export { getResults, submitResult };
