type Team = {
  id: number;
  name: string;
  // набор строк в формате 'ddd hh:mm-hh:mm' в которые начинаются и заканчиваются занятия, например 'mon 19:45-21:15'
  slots: string[];
  // Имя тренера группы
  trainer: string;
  notes: string;
};

export type { Team };
