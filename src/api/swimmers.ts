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

export { submitSwimmer, type CreateSwimmerBody };
