import { Spin, Tooltip } from "antd";
import { useStorageState } from "../../utils/useStorageState";
import { CheckboxButton } from '../../components/checkboxButton';
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
import { useEffect, useRef, useState, type Dispatch, type FC, type ReactNode, type SetStateAction } from "react";
import type { CheckboxProps } from "antd/lib/checkbox";
import type { Equipment } from "../../types/equipment";

const EQUIPMENT_LIST = [
  "fingerPaddle",
  "handPaddle",
  "pullBuoy",
  "board",
  "breakBelt",
  "snorkel",
  "wetsuit",
  "swimfin",
  "monofin",
] as const;

type EquipmentKeys = (typeof EQUIPMENT_LIST)[number];

const EQUIPMENT_ICON: Record<EquipmentKeys, ReactNode> = {
  swimfin: <SwimfinIcon />,
  fingerPaddle:  <FingerPaddleIcon />,
  handPaddle: <HandPaddleIcon />,
  pullBuoy: <PullBuoyIcon />,
  board: <BoardIcon />,
  wetsuit: <WetsuitIcon />,
  breakBelt: <BreakBeltIcon />,
  snorkel: <SnorkelIcon />,
  monofin: <MonofinIcon />,
};

const EQUIPMENT_LABEL: Record<(typeof EQUIPMENT_LIST)[number], ReactNode> = {
  swimfin: "Ласты",
  fingerPaddle:  "Кистевые лопатки",
  handPaddle: "Большие лопатки",
  pullBuoy: "Колобашка",
  board: "Доска",
  wetsuit: "Гидрокостюм",
  breakBelt: "Тормоза",
  snorkel: "Трубка",
  monofin: "Моноласта",
}

const useEquipmentState = () => {
  return useStorageState({
    fingerPaddle: false,
    handPaddle: false,
    pullBuoy: false,
    board: false,
    wetsuit: false,
    breakBelt: false,
    snorkel: false,
    swimfin: false,
    monofin: false,
  }, 'addResult.equipment');
};

const EquipmentPicker: FC<{ onChange: (eq: Equipment) => (void | Promise<any>), value: Equipment, className?: string; }> = ({ onChange, className, value }) => {
  const [isLoading, setLoading] = useState(false);
  const changeWrap = async (eq: Equipment) => {
    try {
      const p = onChange(eq);
      console.log(p, p instanceof Promise);
      if (p instanceof Promise) {
        setLoading(true);
        await p;
      }
    } finally {
      setLoading(false);
    }
  };
  const checkboxHolder: (holder: EquipmentKeys) => CheckboxProps["onChange"] = (handler) => (e) => {
    changeWrap({
      ...value,
      [handler]: e.target.checked,
    });
  };

  const onFingerPaddleChange: CheckboxProps["onChange"] = (e) => {
    if (e.target.checked && value.handPaddle) {
      changeWrap({
        ...value,
        handPaddle: false,
        fingerPaddle: true,
      });
      return;
    }
    checkboxHolder('fingerPaddle')(e);
  }

  const onHandlePaddleChange: CheckboxProps["onChange"] = (e) => {
    if (e.target.checked && value.fingerPaddle) {
      changeWrap({
        ...value,
        handPaddle: true,
        fingerPaddle: false,
      });
      return;
    }
    checkboxHolder('handPaddle')(e);
  }

  const onSwimfinChange: CheckboxProps["onChange"] = (e) => {
    if (e.target.checked && value.monofin) {
      onChange({
        ...value,
        swimfin: true,
        monofin: false,
      });
      return;
    }
    checkboxHolder('swimfin')(e);
  };

  const onMonofinChange: CheckboxProps["onChange"] = (e) => {
    if (e.target.checked && value.swimfin) {
      changeWrap({
        ...value,
        swimfin: false,
        monofin: true,
      });
      return;
    }
    checkboxHolder('monofin')(e);
  };

  const state: Record<(typeof EQUIPMENT_LIST)[number], [boolean, CheckboxProps["onChange"]]> = {
    fingerPaddle: [value.fingerPaddle, onFingerPaddleChange],
    handPaddle: [value.handPaddle, onHandlePaddleChange],
    pullBuoy: [value.pullBuoy, checkboxHolder('pullBuoy')],
    board: [value.board, checkboxHolder('board')],
    wetsuit: [value.wetsuit, checkboxHolder('wetsuit')],
    breakBelt: [value.breakBelt, checkboxHolder('breakBelt')],
    snorkel: [value.snorkel, checkboxHolder('snorkel')],
    swimfin: [value.swimfin, onSwimfinChange],
    monofin: [value.monofin, onMonofinChange],
  }

  return (
    <Spin className={className} spinning={isLoading} description="Сохранение">
      {
        EQUIPMENT_LIST.map(eq => (
          <Tooltip key={eq} title={EQUIPMENT_LABEL[eq]}>
            <CheckboxButton className={cn.equipmentBtn} icon={EQUIPMENT_ICON[eq]} checked={state[eq][0]} onChange={state[eq][1]} />
          </Tooltip>
        ))
      }
    </Spin>
  );
};

export { EquipmentPicker, EQUIPMENT_LIST, EQUIPMENT_ICON, EQUIPMENT_LABEL, useEquipmentState };
