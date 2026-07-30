import { Select } from "antd";
import { plural } from "../../utils/plural";
import type { FC } from "react";

const MILE = 1852;
const DISTANCES = [
  25,
  50,
  100,
  200,
  400,
  500,
  800,
  1000,
  1500,
  2000,
  3000,
  5000,
  10000,
  MILE,
  MILE * 2,
]

const distanceName = (distance: number, short: boolean = false) => {
  if (distance < 1000) {
    return `${distance}${short ? 'м': plural(distance, [' метр', ' метров', ' метра'])}`
  }
  if (distance === 1000) {
    return "Километр";
  }
  const miles = distance / MILE;
  if (miles === Math.floor(miles)) {
    return miles === 1 ? 'Миля' : `${miles} ${plural(distance, ['миля', 'миль', 'мили'])}`
  }
  const km = distance / 1000;
  return `${km}${short ? 'км': plural(km, [' километр', ' километров', ' километра'])}`
}

const OPTIONS = DISTANCES.map((value) => ({ value, label: distanceName(value) }));

const DistanceSelect: FC<{ className?: string; value: number; onChange: ((v: number) =>void) }> = ({className, value, onChange}) => (
  <Select
    className={className}
    value={value}
    onChange={onChange}
    options={OPTIONS}
  />
);

export { DistanceSelect, distanceName };
