import type { StagesRawInput } from "./stages";

const getStandardDeviation = (arr: Array<number>) => Math.sqrt(arr.reduce((sum, val) => sum + val * val, 0) / arr.length);

const isSpeedDistributed = (speed: number[]) => {
  const mid = getStandardDeviation(speed);
  for (const val of speed) {
    console.log(mid, val, speed, Math.abs(val - mid), mid / 2);
    if (Math.abs(val - mid) > mid / 2) {
      return true;
    }
  }
  return false;
};

const normalizeSpeed = (results: Array<number>, distance: number) => results.map(v => v / distance * 100);

const stagesSpeed = (stages: StagesRawInput) => stages.map(({ result, distance }) => result / distance * 100);

export { isSpeedDistributed, normalizeSpeed, stagesSpeed };
