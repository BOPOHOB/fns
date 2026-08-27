import type { Results } from "./results";
import type { Team as TeamJSON } from "../types/team";
import { computed, makeObservable, observable, runInAction } from "mobx";
import { formatSlots } from "../shared/slots";
import {
  setTeamMembers as putTeamMembers,
  setTeamTrainer as putTeamTrainer,
} from "../api/teams";

class Team {
  readonly #model: WeakRef<Results>;
  trainerId: number | null;

  constructor(private readonly data: TeamJSON, model: Results) {
    this.#model = new WeakRef(model);
    this.trainerId = data.trainerId;
    makeObservable(this, {
      trainerId: observable,
      trainer: computed,
      members: computed,
      slotsLabel: computed,
      label: computed,
      row: computed,
    });
  }

  readonly setTrainer = async (trainerId: number | null) => {
    const { trainerId: saved } = await putTeamTrainer(this.id, trainerId);
    runInAction(() => {
      this.trainerId = saved;
    });
  };

  readonly setMembers = async (swimmerIds: number[]) => {
    const { swimmerIds: saved } = await putTeamMembers(this.id, swimmerIds);
    const selected = new Set(saved);
    const model = this.#model.deref()!;
    runInAction(() => {
      for (const swimmer of model.swimmers) {
        const without = swimmer.teamIds.filter((id) => id !== this.id);
        swimmer.setTeamIds(
          selected.has(swimmer.id) ? [...without, this.id] : without,
        );
      }
    });
  };

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

  get key() {
    return this.id;
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
