import type { Result as ResultJSON } from "../types/result";
import type { Results } from "./results";

class Result {
  readonly #model: WeakRef<Results>;

  constructor(private readonly data: ResultJSON, model: Results) {
    this.#model = new WeakRef(model);
  }
};

export { Result };
