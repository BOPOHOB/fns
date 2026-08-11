type StagesRawInput = Array<{
  result: number | null;
  distance: number;
}>;


const STAGE_OPTIONS = [25,50,100,200] as const;
type Stage = (typeof STAGE_OPTIONS)[number] | null;
const STAGE_INTERVALS = [{
  value: 0,
  label: 'Без разбивки',
}, ...STAGE_OPTIONS.map((v) => ({
  value: v, label: `${v}`
}))];

export { type StagesRawInput, STAGE_INTERVALS, type Stage };
