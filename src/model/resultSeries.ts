import type { Results } from "./results";
import type { ResultSeries as ResultSeriesJSON } from "../types/resultSeries";
import dayjs from "dayjs";

class ResultSeries {
  readonly #model: WeakRef<Results>;

  constructor(private readonly data: ResultSeriesJSON, model: Results) {
    this.#model = new WeakRef(model);
  }

  get swimmer() {
    return this.results.at(0).swimmer;
  }

  get id() {
    return this.data.id;
  }

  get key() {
    return this.data.id;
  }

  get date() {
    return dayjs(this.data.date);
  }

  get regime() {
    return this.data.regime;
  }

  get speed() {
    return this.data.speed;
  }

  get repetitions() {
    return this.data.repetitions;
  }

  /** Результаты серии по возрастанию даты (порядок повторов). */
  get results() {
    const model = this.#model.deref();
    if (!model) return [];
    return model.results
      .filter((r) => r.seriesId === this.id)
      .slice()
      .sort((a, b) => a.date.valueOf() - b.date.valueOf());
  }
}

export { ResultSeries };
