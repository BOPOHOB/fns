import type { PublicSwimmer, Sex } from '../types/swimmer';
import { apiFetch } from './client';

type CreateSwimmerBody = {
  name: string;
  sex: Sex;
  /** YYYY-MM-DD */
  birthDate?: string;
  teamIds: number[];
};

const submitSwimmer = (body: CreateSwimmerBody) =>
  apiFetch<PublicSwimmer>('/api/swimmers', {
    method: 'POST',
    body: JSON.stringify(body),
  });

const setSwimmerBirthDate = (swimmerId: number, birthDate: string | null) =>
  apiFetch<{ birthDate: string | null }>(`/api/swimmers/${swimmerId}/birth-date`, {
    method: 'PUT',
    body: JSON.stringify({ birthDate }),
  });

const setSwimmerName = (swimmerId: number, name: string) =>
  apiFetch<{ name: string }>(`/api/swimmers/${swimmerId}/name`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });

export { submitSwimmer, setSwimmerBirthDate, setSwimmerName, type CreateSwimmerBody };
