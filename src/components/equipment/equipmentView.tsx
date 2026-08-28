import type { FC } from "react";
import { EQUIPMENT_ICON, EQUIPMENT_LABEL, EQUIPMENT_LIST } from "./equipmentPicker";
import { Tooltip } from "antd";

import cn from './equipment.module.less';
import type { Equipment } from "../../types/equipment";

const EquipmentView: FC<Partial<Equipment>> = ({ ...equipment }) => EQUIPMENT_LIST.filter(eq => equipment[eq]).map(eq => (
  <Tooltip key={eq} title={EQUIPMENT_LABEL[eq]}>
    <div className={cn.equipmentView}>{EQUIPMENT_ICON[eq]}</div>
  </Tooltip>
));

export { EquipmentView };
