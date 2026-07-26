type Swimmer = {
  id: number;
  // Группы, в которые ходит пловец
  teamId: number[];
  name: string;
  // YYYY-MM-DD
  birthDate?: string;
  sex: 'male' | 'female';
  notes: string;
  privateNotes: string;
};

/** Публичное представление пловца (без privateNotes). */
type PublicSwimmer = Omit<Swimmer, 'privateNotes'>;

export type { Swimmer, PublicSwimmer };
