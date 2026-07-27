import type { Results } from "./results";
import type { Swimmer as SwimmerJSON } from "../types/swimmer";

class Swimmer {
  readonly #model: WeakRef<Results>;

  constructor(private readonly data: SwimmerJSON, model: Results) {
    this.#model = new WeakRef(model);
  }

  get key() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }
}

export { Swimmer };
