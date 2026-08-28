import type { StagesRawInput } from "../pages/addResult/stages";
import type { Equipment } from "../types/equipment";
import type { Result, Stroke } from "../types/result";
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

const submitResult = async (result: Omit<Result, 'id' | 'result' | 'stages'> & { speed: number | null; interval: number | null; result: number[], stages: StagesRawInput[] }): Promise<ResultResponse> => {
  if (result.result.length === 1) {
    delete result.speed;
    delete result.interval;
    const body = JSON.stringify({
      ...result,
      result: result.result[0],
      stages: result.stages[0],
    });
    const response = await apiFetch<Result>('/api/results', { method: 'POST', body });
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

const setResultDate = (resultId: number, date: string) =>
  apiFetch<{ date: string }>(`/api/results/${resultId}/date`, {
    method: 'PUT',
    body: JSON.stringify({ date }),
  });

const setResultEquipment = (resultId: number, data: Equipment) =>
  apiFetch<Equipment>(`/api/results/${resultId}/equipment`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

const setResultStroke = (resultId: number, stroke: Stroke | null) =>
  apiFetch<{ stroke: Stroke | null }>(`/api/results/${resultId}/stroke`, {
    method: 'PUT',
    body: JSON.stringify({ stroke }),
  });

export { getResults, submitResult, setResultDate, setResultEquipment, setResultStroke };
