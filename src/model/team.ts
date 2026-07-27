import type { Results } from "./results";
import type { Team as TeamJSON } from "../types/team";

class Team {
  readonly #model: WeakRef<Results>;

  constructor(private readonly data: TeamJSON, model: Results) {
    this.#model = new WeakRef(model);
  }
}

export { Team };
