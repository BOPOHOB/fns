import type { Team } from '../types/team';
import { apiFetch } from './client';

type CreateTeamBody = {
  name: string;
  trainerId: number | null;
  slots: string[];
  notes: string;
};

const submitTeam = (body: CreateTeamBody) =>
  apiFetch<Team>('/api/teams', {
    method: 'POST',
    body: JSON.stringify(body),
  });

const setTeamMembers = (teamId: number, swimmerIds: number[]) =>
  apiFetch<{ swimmerIds: number[] }>(`/api/teams/${teamId}/members`, {
    method: 'PUT',
    body: JSON.stringify({ swimmerIds }),
  });

const setTeamTrainer = (teamId: number, trainerId: number | null) =>
  apiFetch<{ trainerId: number | null }>(`/api/teams/${teamId}/trainer`, {
    method: 'PUT',
    body: JSON.stringify({ trainerId }),
  });

const deleteTeam = (teamId: number) =>
  apiFetch<{ ok: true }>(`/api/teams/${teamId}`, {
    method: 'DELETE',
  });

export { submitTeam, setTeamMembers, setTeamTrainer, deleteTeam, type CreateTeamBody };
