import type { Results } from "./results";
import type { ResultSeries as ResultSeriesJSON } from "../types/resultSeries";

class ResultSeries {
  readonly #model: WeakRef<Results>;

  constructor(private readonly data: ResultSeriesJSON, model: Results) {
    this.#model = new WeakRef(model);
  }
};

export { ResultSeries };
