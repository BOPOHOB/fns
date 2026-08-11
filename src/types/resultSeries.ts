// часто значимые результаты достигаются на тренировках но понятны только в рамках анализа серии коротких заплывов. ResultSeries - объект, объединяющий группу результатов в серию.
type ResultSeries = {
  id: number;
  // YYYY-MM-DD HH:MM:SS (канонический формат SQLite datetime)
  date: string;
  // Сколько времени на каждое повторение (интервал); null если не задан
  regime: number | null;
  // За сколько надо проплыть повторение; null если не задан
  speed: number | null;
  // Сколько повторений
  repetitions: number;
};

export type { ResultSeries };
