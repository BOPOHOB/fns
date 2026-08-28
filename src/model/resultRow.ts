import type { Dayjs } from "dayjs";
import { Result } from "./result";
import { ResultSeries } from "./resultSeries";
import type { Equipment } from "../types/equipment";
import type { Stroke } from "../types/result";

class ResultRow {
  constructor(private readonly data: Result | ResultSeries) {}

  get id() {
    return this.results.at(0).id;
  }

  get key() {
    return this.id;
  }

  get swimmer() {
    return this.data.swimmer;
  }

  get stroke(): Stroke | null {
    return this.results.at(0).stroke;
  }

  readonly updateStroke = (stroke: Stroke) => {
    return Promise.all(this.results.map((r) => r.updateStroke(stroke)));
  }

  get equipment(): Equipment {
    return this.results.at(0).equipment;
  }

  readonly updateEquipment = (eq: Equipment) => {
    return Promise.all(this.results.map(r => r.updateEquipment(eq)));
  }

  get results(): Result[] {
    return this.data instanceof ResultSeries ? this.data.results : [this.data];
  }

  get isSeries(): boolean {
    return this.data instanceof ResultSeries;
  }

  get result() { 
    const { results } = this;
    const duration = results.reduce((prw, cur) => prw + cur.result, 0);
    return duration / results.length;
  }

  get distance() {
    return this.results.at(0).distance;
  }

  get date() {
    return this.data.date;
  }

  get notes() {
    return this.results.at(0).notes;
  }

  get water() { return this.results.at(0).water; }
  get condition() { return this.results.at(0).condition; }

  readonly setDate = (date: Dayjs) => {
    return Promise.all(this.results.map(result => result.setDate(date)));
  }

  get speed() { return this.result / this.distance * 100; }

  static fromResults(results: Result[]): ResultRow[] {
    const series = new Set<number>();
    const rows: ResultRow[] = [];
    for (const result of results) {
      if (result.seriesId !== undefined) {
        if (!series.has(result.seriesId)) {
          series.add(result.seriesId);
          rows.push(new ResultRow(result.series));
        }
      } else {
        rows.push(new ResultRow(result));
      }
    }
    return rows;
  }
};

export { ResultRow };
