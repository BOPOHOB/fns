import type { Stages } from "../types/result.ts";
import { distanceName, stringifySeconds } from "./format.ts";

/**
 * Сколько «шагов» stageStep в одной строке при переносе (OG 1200×630).
 * Ключ — число шагов на всю дистанцию (totalDistance / stageStep).
 */
const STAGE_CHUNK_LENGTH: Record<number, number> = {
  11: 6,
  12: 6,
  13: 7,
  14: 7,
  15: 8,
  16: 8,
  17: 9,
  18: 9,
  19: 10,
  20: 10,
  21: 8,
  22: 8,
  23: 8,
  24: 8,
  25: 9,
  26: 9,
  27: 9,
};

const STAGE_CHUNK_FALLBACK = 10;

type StageCell = {
  /** Верхняя строка: накопленная дистанция или диапазон */
  distanceLabel: string;
  /** Нижняя строка: время и опционально темп на 100 м */
  paceLabel: string;
  /** Ширина в единицах stageStep (1 = одна ячейка) */
  span: number;
};

type StagesRow = {
  cells: StageCell[];
  /** Накопленная дистанция до начала строки (м) */
  startPos: number;
};

function stageStepOf(stages: Stages): number {
  if (!stages.length) return 1;
  return stages.reduce((min, cur) => Math.min(min, cur.distance), Infinity);
}

function chunkStages(
  stages: Stages,
  stageStep: number,
  totalDistance: number,
): Stages[] {
  const stagesAmount = totalDistance / stageStep;
  if (stagesAmount < 8) {
    return stages.length ? [stages] : [];
  }
  const stageChunkLength = STAGE_CHUNK_LENGTH[stagesAmount] ?? STAGE_CHUNK_FALLBACK;
  const chunks: Stages[] = [];
  let passed = 0;
  let cur = 0;
  for (const [id, { distance }] of stages.entries()) {
    if (passed >= stageChunkLength) {
      chunks.push(stages.slice(cur, id));
      cur = id;
      passed = 0;
    }
    passed += distance / stageStep;
  }
  if (passed !== 0) {
    chunks.push(stages.slice(cur));
  }
  return chunks;
}

function cellsForChunk(stages: Stages, stageStep: number, startPos: number): StageCell[] {
  let pos = startPos;
  return stages.map((stage) => {
    const span = stage.distance / stageStep;
    const from = pos;
    pos += stage.distance;
    const distanceLabel = span === 1 ? String(pos) : `${from} - ${pos}`;
    const pace =
      span !== 1
        ? `(${stringifySeconds((stage.result / stage.distance) * 100)})`
        : null;
    const paceLabel = [stringifySeconds(stage.result), pace].filter(Boolean).join(" ");
    return { distanceLabel, paceLabel, span };
  });
}

/**
 * Раскладка разбивки для OG: строки с ячейками «дистанция / темп».
 * Без stages — одна ячейка с названием дистанции и итогом.
 */
function buildStagesRows(
  stages: Stages | null | undefined,
  totalDistance: number,
  totalResult: number,
): StagesRow[] {
  const list = stages ?? [];
  if (!list.length) {
    return [
      {
        startPos: 0,
        cells: [
          {
            distanceLabel: distanceName(totalDistance, true),
            paceLabel: stringifySeconds(totalResult),
            span: 1,
          },
        ],
      },
    ];
  }

  const stageStep = stageStepOf(list);
  const chunks = chunkStages(list, stageStep, totalDistance);
  let pos = 0;
  return chunks.map((chunk) => {
    const startPos = pos;
    const cells = cellsForChunk(chunk, stageStep, startPos);
    pos += chunk.reduce((sum, s) => sum + s.distance, 0);
    return { startPos, cells };
  });
}

export {
  buildStagesRows,
  chunkStages,
  stageStepOf,
  STAGE_CHUNK_LENGTH,
  type StageCell,
  type StagesRow,
};
