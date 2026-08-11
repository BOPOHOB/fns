import type { Results } from "./results";
import type { Team as TeamJSON } from "../types/team";
import { action, computed, makeObservable, observable } from "mobx";
import { formatSlots } from "../shared/slots";

class Team {
  readonly #model: WeakRef<Results>;
  trainerId: number | null;

  constructor(private readonly data: TeamJSON, model: Results) {
    this.#model = new WeakRef(model);
    this.trainerId = data.trainerId;
    makeObservable(this, {
      trainerId: observable,
      setTrainerId: action,
      trainer: computed,
      members: computed,
      slotsLabel: computed,
      label: computed,
      row: computed,
    });
  }

  setTrainerId(id: number | null) {
    this.trainerId = id;
  }

  get trainer() {
    const id = this.trainerId;
    if (id == null) return undefined;
    return this.#model.deref()!.swimmersMap.get(id);
  }

  get members() {
    return this.#model.deref()!.swimmers.filter((s) => s.teamIds.includes(this.id));
  }

  get slots() {
    return this.data.slots;
  }

  get slotsLabel() {
    return formatSlots(this.data.slots);
  }

  get notes() {
    return this.data.notes;
  }

  get label() {
    const slots = this.slotsLabel;
    return [
      this.data.name,
      slots.length > 0 ? `${slots.join(', ')}` : false,
      this.trainer?.name,
    ].filter(Boolean).join(' ');
  }

  get id() {
    return this.data.id;
  }

  get name() {
    return this.data.name;
  }

  get row() {
    return {
      key: this.id,
      id: this.id,
      name: this.name,
      trainerId: this.trainerId,
      slots: this.slotsLabel,
      memberIds: this.members.map((s) => s.id),
    };
  }
}

export { Team };
