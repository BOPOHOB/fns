import dayjs from "dayjs";
import { action, makeObservable, observable } from "mobx";
import type { ResultCondition, Result as ResultJSON } from "../types/result";
import type { Results } from "./results";
import { distanceName } from "../pages/addResult/distanceSelect";

class Result {
  readonly #model: WeakRef<Results>;
  dateIso: string;

  constructor(private readonly data: ResultJSON, model: Results) {
    this.#model = new WeakRef(model);
    this.dateIso = data.date;

    makeObservable(this, {
      dateIso: observable,
      setDate: action,
    });
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

  get seriesId() {
    return this.data.seriesId;
  }

  /** Серия, в которую входит результат; `undefined` если одиночный. */
  get series() {
    const id = this.data.seriesId;
    if (id == null) return undefined;
    return this.#model.deref()?.series.find((s) => s.id === id);
  }

  get notes() {
    return this.data.notes;
  }

  get water() {
    return this.data.water;
  }

  get fifty() {
    return this.data.water === "fifty";
  }

  get date() {
    return dayjs(this.dateIso);
  }

  setDate(date: string) {
    this.dateIso = date;
  }

  get stageStep() {
    return this.data.stages.reduce((prw, cur) => Math.min(prw, cur.distance), Infinity);
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
