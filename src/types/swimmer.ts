type SwimmerRole = 'user' | 'trainer';

type Sex = 'male' | 'female';

type Swimmer = {
  id: number;
  // Группы, в которые ходит пловец
  teamId: number[];
  name: string;
  // YYYY-MM-DD
  birthDate?: string;
  sex: Sex;
  role: SwimmerRole;
  /** Логин Яндекса; не отдаётся в публичном API */
  yandexLogin?: string;
  notes: string;
  privateNotes: string;
};

/** Публичное представление пловца (без privateNotes и yandexLogin). */
type PublicSwimmer = Omit<Swimmer, 'privateNotes' | 'yandexLogin'>;

export type { Swimmer, PublicSwimmer, SwimmerRole, Sex };
