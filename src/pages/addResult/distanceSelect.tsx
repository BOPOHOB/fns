import { Select } from "antd";
import type { FC } from "react";
import { ALLOWED_DISTANCES } from "../../shared/distances";
import { distanceName } from "../../shared/format";

const DISTANCES = Array.from(ALLOWED_DISTANCES.values()).sort((a, b) => a - b);
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
