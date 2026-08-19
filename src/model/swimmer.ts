import type { Results } from "./results";
import type { Sex, Swimmer as SwimmerJSON } from "../types/swimmer";
import { action, computed, makeObservable, observable } from "mobx";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

class Swimmer {
  readonly #model: WeakRef<Results>;
  teamId: number[];
  birthDate: string | undefined;
  name: string;
  sex: Sex;

  constructor(private readonly data: SwimmerJSON, model: Results) {
    this.#model = new WeakRef(model);
    this.teamId = [...data.teamId];
    this.birthDate = data.birthDate;
    this.name = data.name;
    this.sex = data.sex;

    makeObservable(this, {
      teamId: observable,
      birthDate: observable,
      name: observable,
      sex: observable,
      setTeamIds: action,
      setBirthDate: action,
      setName: action,
      setSex: action,
      bestSex: computed,
      bestGroup: computed,
      sexEmoji: computed,
      sexTooltip: computed,
      age: computed,
      row: computed,
      results: computed
    });
  }

  setTeamIds(ids: number[]) {
    this.teamId = [...ids];
  }

  setBirthDate(date: string | undefined) {
    this.birthDate = date;
  }

  setName(name: string) {
    this.name = name;
  }

  setSex(sex: Sex) {
    this.sex = sex;
  }

  get key() {
    return this.data.id;
  }

  get id() {
    return this.data.id;
  }

  get age(): number | undefined {
    if (!this.birthDate) return undefined;

    const birth = dayjs(this.birthDate, 'YYYY-MM-DD', true);
    if (!birth.isValid()) return undefined; 

    const age = dayjs().diff(birth, 'year');
    return age >= 0 ? age : undefined;
  }

  get bestSex(): boolean {
    return this.#model.deref().lader.find(swimmer => swimmer.sex === this.sex) === this;
  }
  get bestGroup(): boolean {
    return this.#model.deref().lader.find(swimmer =>
      swimmer.sex === this.sex &&
      swimmer.teamIds.some((id) => this.teamIds.includes(id))
    ) === this;
  }

  get role() {
    return this.data.role;
  }

  get teamIds() {
    return this.teamId;
  }
  
  get sexEmoji() {
    let emoji: Record<Sex, string> = { female:'🤵‍♀️', male: '🤵' };
    if (this.bestSex) emoji = { female:'👸', male: '🫅' };
    if (this.bestGroup) emoji = { female:'🧝‍♀️', male: '🧝🏻' };
    return emoji[this.sex];
  }

  get sexTooltip() {
    let tooltip = {};
    if (this.bestSex) tooltip = {
      female: 'Обладательница сильнейшего результата среди женщин',
      male: 'Обладатель сильнейшего результата среди мужчин'
    };
    if (this.bestGroup) tooltip = {
      female: 'Обладательница сильнейшего результата среди женщин своей группы',
      male: 'Обладатель сильнейшего результата среди мужчин своей группы'
    };
    return tooltip[this.sex];
  }

  get results() {
    return this.#model.deref().results.filter((result) => result.swimmerId === this.id);
  }

  get row() {
    const results = {};

    for (const result of this.results) {
      if (!results[result.distance]) {
        results[result.distance] = [];
      }
      results[result.distance].push(result);
    }

    return {
      key: this.key,
      id: this.id,
      name: this.name,
      sexTooltip: this.sexTooltip,
      sexEmoji: this.sexEmoji,
      age: this.age,
      ...results,
    };
  }
}

export { Swimmer };
