
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
type Stroke = 'butterfly' | 'backstroke' | 'breaststroke' | 'freestyle' | 'medley';

type Stages = Array<{
  result: number;
  // при замере этапов разбивки могут быть не равномерными, в бассейне круги тренер может пропускать а в открытой воде промежуточный замер скорости может ставиться случайно
  distance: number;
}>;
  
type Result = {
  id: number;
  swimmerId: number;
  seriesId?: number;
  // Всегда в секундах
  result: number;
  distance: number;
  // ISO 8601 (например 2024-07-30T10:15:00.000Z); Z = UTC
  // Дату выставляет фронтенд. Это может быть как добавление постфактум так и заполнение серии на лету — тогда момент с точностью до секунд определяет место результата в серии.
  date: string;
  type: ResultCondition;
  water: WaterType;
  stroke: Stroke | null;
  stages: Stages | null;
  notes: string;
  swimfin: boolean;
  fingerPaddle: boolean;
  handPaddle: boolean;
  pullBuoy: boolean;
  board: boolean;
  breakBelt: boolean;
  snorkel: boolean;
  wetsuit: boolean;
  monofin: boolean;
};

export type { DistanceName, ResultCondition, WaterType, Stroke, Result, Stages };
