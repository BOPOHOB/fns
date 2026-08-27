import { Tooltip } from "antd";
import { useStorageState } from "../../../utils/useStorageState";
import { CheckboxButton } from '../../../components/checkboxButton';
import {
  BoardIcon,
  BreakBeltIcon,
  FingerPaddleIcon,
  HandPaddleIcon,
  MonofinIcon,
  PullBuoyIcon,
  SnorkelIcon,
  SwimfinIcon,
  WetsuitIcon,
} from './icons';

import cn from './equipment.module.less';
import { useEffect, type FC } from "react";
import type { WaterType } from "../../../types/result";

type Equipment = {
  swimfin: boolean;
  fingerPaddle: boolean;
  handPaddle: boolean;
  pullBuoy: boolean;
  board: boolean;
  wetsuit: boolean;
  breakBelt: boolean;
  snorkel: boolean;
  monofin: boolean;
};

const EquipmentPicker: FC<{ water: WaterType, onChange: (eq: Equipment) => void }> = ({ water, onChange }) => {
  const [swimfin, setSwimfin] = useStorageState(false, 'addResult.equipment.swimfin');
  const [fingerPaddle, setFingerPaddle] = useStorageState(false, 'addResult.equipment.fingerPaddle');
  const [handPaddle, setHandPaddle] = useStorageState(false, 'addResult.equipment.handPaddle');
  const [pullBuoy, setPullBuoy] = useStorageState(false, 'addResult.equipment.pullBuoy');
  const [board, setBoard] = useStorageState(false, 'addResult.equipment.board');
  const [wetsuit, setWetsuit] = useStorageState(false, 'addResult.equipment.wetsuit');
  const [breakBelt, setBreakBelt] = useStorageState(false, 'addResult.equipment.breakBelt');
  const [snorkel, setSnorkel] = useStorageState(false, 'addResult.equipment.snorkel');
  const [monofin, setMonofin] = useStorageState(false, 'addResult.equipment.monofin');

  // Выключаем оборудование на открытой воде
  useEffect(() => {
    if (water === 'open') {
      setSwimfin(false);
      setHandPaddle(false);
      setPullBuoy(false);
      setBoard(false);
    }
  }, [water]);

  useEffect(() => {
    onChange({
      swimfin, fingerPaddle, handPaddle, pullBuoy, board, wetsuit, breakBelt, snorkel, monofin
    });
  },
  [swimfin, fingerPaddle, handPaddle, pullBuoy, board, wetsuit, breakBelt, snorkel, monofin ]);

  const onFingerPaddleChange = (e) => {
    if (e.target.checked && handPaddle) {
      setHandPaddle(false);
    }
    setFingerPaddle(e.target.checked);
  }

  const onHandlePaddleChange = (e) => {
    if (e.target.checked && fingerPaddle) {
      setFingerPaddle(false);
    }
    setHandPaddle(e.target.checked);
  }

  const onSwimfinChange = (e) => {
    if (e.target.checked && monofin) {
      setMonofin(false);
    }
    setSwimfin(e.target.checked)
  };

  const onMonofinChange = (e) => {
    if (e.target.checked && swimfin) {
      setSwimfin(false);
    }
    setMonofin(e.target.checked)
  };

  return (
    <>
      <Tooltip title="Ласты">
        <CheckboxButton className={cn.equipmentBtn} icon={<SwimfinIcon />} checked={swimfin} onChange={onSwimfinChange} />
      </Tooltip>
      <Tooltip title="Кистевые лопатки">
        <CheckboxButton className={cn.equipmentBtn} icon={<FingerPaddleIcon />} checked={fingerPaddle} onChange={onFingerPaddleChange} />
      </Tooltip>
      <Tooltip title="Большие лопатки">
        <CheckboxButton className={cn.equipmentBtn} icon={<HandPaddleIcon />} checked={handPaddle} onChange={onHandlePaddleChange} />
      </Tooltip>
      <Tooltip title="Колобашка">
        <CheckboxButton className={cn.equipmentBtn} icon={<PullBuoyIcon />} checked={pullBuoy} onChange={(e) => setPullBuoy(e.target.checked)} />
      </Tooltip>
      <Tooltip title="Доска">
        <CheckboxButton className={cn.equipmentBtn} icon={<BoardIcon />} checked={board} onChange={(e) => setBoard(e.target.checked)} />
      </Tooltip>
      <Tooltip title="Тормоза">
        <CheckboxButton className={cn.equipmentBtn} icon={<BreakBeltIcon />} checked={breakBelt} onChange={(e) => setBreakBelt(e.target.checked)} />
      </Tooltip>
      <Tooltip title="Трубка">
        <CheckboxButton className={cn.equipmentBtn} icon={<SnorkelIcon />} checked={snorkel} onChange={(e) => setSnorkel(e.target.checked)} />
      </Tooltip>
      <Tooltip title="Гидрокостюм">
        <CheckboxButton className={cn.equipmentBtn} icon={<WetsuitIcon />} checked={wetsuit} onChange={(e) => setWetsuit(e.target.checked)} />
      </Tooltip>
      <Tooltip title="Моноласта">
        <CheckboxButton className={cn.equipmentBtn} icon={<MonofinIcon />} checked={monofin} onChange={onMonofinChange} />
      </Tooltip>
    </>
  );
};

export { EquipmentPicker, type Equipment };
