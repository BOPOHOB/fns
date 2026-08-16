import type { Stages } from "../types/result.ts";
import {
  distanceName,
  formatRuDateValue,
  stringifySeconds,
} from "./format.ts";
import { buildStagesRows } from "./stagesLayout.ts";

type ResultMetaInput = {
  distance: number;
  result: number;
  date: string;
  swimmerName: string;
  stages: Stages | null | undefined;
};

function formatStagesPlain(
  stages: Stages | null | undefined,
  distance: number,
  result: number,
): string {
  const list = stages ?? [];
  if (!list.length) return "";
  return buildStagesRows(list, distance, result)
    .flatMap((row) => row.cells)
    .map((cell) => `${cell.distanceLabel} ${cell.paceLabel}`)
    .join(" · ");
}

/** Title / description for document head and Open Graph. */
function formatResultMeta(input: ResultMetaInput): {
  title: string;
  description: string;
} {
  const title = `${distanceName(input.distance, true)} · ${stringifySeconds(input.result)}`;
  const parts = [
    input.swimmerName,
    formatRuDateValue(input.date),
    formatStagesPlain(input.stages, input.distance, input.result),
  ].filter(Boolean);
  return {
    title,
    description: parts.join(" · "),
  };
}

export { formatResultMeta, formatStagesPlain, type ResultMetaInput };
