import dayjs from "dayjs";
import type { ResultCondition, Result as ResultJSON } from "../types/result";
import type { Results } from "./results";
import { distanceName } from "../pages/addResult/distanceSelect";

class Result {
  readonly #model: WeakRef<Results>;

  constructor(private readonly data: ResultJSON, model: Results) {
    this.#model = new WeakRef(model);
  }

  get id() {
    return this.data.id;
  }

  get key() {
    return this.data.id;
  }

  get speed() {
    return this.data.result / this.data.distance * 100;
  }

  get result() {
    return this.data.result;
  }

  get distance() {
    return this.data.distance;
  }

  get distanceName() {
    return distanceName(this.distance);
  }

  get swimmerId() {
    return this.data.swimmerId;
  }

  get water() {
    return this.data.water;
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

  get stages() {
    return this.data.stages ?? [];
  }

  get swimmer() {
    return this.#model.deref().swimmersMap.get(this.data.swimmerId);
  }
};

export { Result };
