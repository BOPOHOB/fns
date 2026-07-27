type Team = {
  id: number;
  name: string;
  // набор строк в формате 'ddd hh:mm-hh:mm' в которые начинаются и заканчиваются занятия, например 'mon 19:45-21:15'
  slots: string[];
  /** Пловец-тренер группы; null если не назначен / удалён */
  trainerId: number | null;
  notes: string;
};

export type { Team };
