import dayjs from "dayjs";
import type { ResultCondition, Result as ResultJSON } from "../types/result";
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

  get swimmerId() {
    return this.data.swimmerId;
  }

  get fifty() {
    return this.data.water === "fifty";
  }

  get date() {
    return dayjs(this.data.date);
  }

  get condition(): ResultCondition | 'open' {
    if (this.data.water === 'open') {
      return 'open';
    }
    return this.data.type
  }

  get swimmer() {
    return this.#model.deref().swimmersMap.get(this.data.swimmerId);
  }
};

export { Result };
