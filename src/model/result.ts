import type { Result as ResultJSON } from "../types/result";
import type { Results } from "./results";

class Result {
  readonly #model: WeakRef<Results>;

  constructor(private readonly data: ResultJSON, model: Results) {
    this.#model = new WeakRef(model);
  }

  get result() {
    return this.data.result;
  }

  get distance() {
    return this.data.distance;
  }

  get swimmer() {
    return this.#model.deref().swimmersMap.get(this.data.swimmerId);
  }
};

export { Result };
