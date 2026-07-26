
type DistanceName =
  | '25m'
  | '50m'
  | '100m'
  | '200m'
  | '400m'
  | '500m'
  | '800m'
  | '1000m'
  | '1500m'
  | '2k'
  | '3k'
  | '5k'
  | '10k'
  | '1ml' // морская миля, 1852 м
  | '2ml'; // 3704 м

type ResultCondition = 'competition' | 'test' | 'workout';
// тип заплыва - открытая вода/25м бассейн или 50м бассейн
type WaterType = 'quarter' | 'fifty' | 'open';
  
type Result = {
  id: number;
  swimmerId: number;
  seriesId?: number;
  // Всегда в секундах
  result: number;
  distance: DistanceName;
  // Дата и время в формате SQLite datetime: YYYY-MM-DD HH:MM:SS
  // Дату выставляет фронтенд. Это может быть как добавление постфактум так и заполнение серии на лету — тогда момент с точностью до секунд определяет место результата в серии.
  date: string;
  type: ResultCondition;
  water: WaterType;
  stages: Array<{
    result: number;
    // при замере этапов разбивки могут быть не равномерными, в бассейне круги тренер может пропускать а в открытой воде промежуточный замер скорости может ставиться случайно
    distance: number;
  }>;
  notes: string;
};

export type { DistanceName, ResultCondition, WaterType, Result };
