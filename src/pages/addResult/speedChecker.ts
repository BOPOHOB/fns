import type { StagesRawInput } from "./stages";

const getStandardDeviation = (arr: Array<number>) => Math.sqrt(arr.reduce((sum, val) => sum + val * val, 0) / arr.length);

const isSpeedDistributed = (speed: number[]) => {
  const mid = getStandardDeviation(speed);
  for (const val of speed) {
    if (Math.abs(val - mid) > mid / 2) {
      return true;
    }
  }
  return false;
};

const speedOutOfRange = (speed: number[]) => speed.findIndex(v => v < 40 || v > 360);

const normalizeSpeed = (results: Array<number>, distance: number) => results.map(v => v / distance * 100);

const stagesSpeed = (stages: StagesRawInput) => stages.map(({ result, distance }) => result / distance * 100);

export { isSpeedDistributed, normalizeSpeed, stagesSpeed, speedOutOfRange };
