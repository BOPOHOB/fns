import type { StagesRawInput } from "../pages/addResult/stages";
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

const nullStagesMapper = (stage: StagesRawInput): Stages => stage.find((v) => v.result === null) !== undefined ? [] : stage;

const submitResult = async (result: Omit<Result, 'id' | 'result' | 'stages'> & { speed: number | null; interval: number | null; result: number[], stages: StagesRawInput[] }): Promise<ResultResponse> => {
  if (result.result.length === 1) {
    delete result.speed;
    delete result.interval;
    const response = await apiFetch<Result>('/api/results', {
      method: 'POST',
      body: JSON.stringify({
        ...result,
        result: result.result[0],
        stages: result.stages.map(nullStagesMapper)[0],
      }),
    });
    return {
      series: null,
      results: [response]
    }
  } else {
    return apiFetch<ResultResponse>('/api/series', {
      method: 'POST',
      body: JSON.stringify({
        ...result,
        stages: result.stages.map(nullStagesMapper)
      }),
    });
  }
}

export { getResults, submitResult };
