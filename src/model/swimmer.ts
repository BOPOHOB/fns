import type { Results } from "./results";
import type { Sex, Swimmer as SwimmerJSON } from "../types/swimmer";
import { computed, makeObservable } from "mobx";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

class Swimmer {
  readonly #model: WeakRef<Results>;

  constructor(private readonly data: SwimmerJSON, model: Results) {
    this.#model = new WeakRef(model);

    makeObservable(this, {
      bestSex: computed,
      bestGroup: computed,
      sexEmoji: computed,
      sexTooltip: computed,
      age: computed,
    });
  }

  get key() {
    return this.data.id;
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get age(): number | undefined {
    if (!this.data.birthDate) return undefined;

    const birth = dayjs(this.data.birthDate, 'YYYY-MM-DD', true);
    if (!birth.isValid()) return undefined; 

    const age = dayjs().diff(birth, 'year');
    return age >= 0 ? age : undefined;
  }

  get bestSex(): boolean {
    return this.#model.deref().lader.find(swimmer => swimmer.sex === this.sex) === this;
  }
  get bestGroup(): boolean {
    return this.#model.deref().lader.find(swimmer => swimmer.sex === this.sex && swimmer.data.teamId === this.data.teamId) === this;
  }

  get sex() {
    return this.data.sex;
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

  get row() {
    return {
      key: this.key,
      name: this.name,
      sexTooltip: this.sexTooltip,
      sexEmoji: this.sexEmoji,
      age: this.age,
    };
  }
}

export { Swimmer };
