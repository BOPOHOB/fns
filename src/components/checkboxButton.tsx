import { Button, type CheckboxChangeEvent, type CheckboxProps } from "antd";
import type { ButtonProps } from "antd/lib/button";
import { useCallback, useState, type FC } from "react";

const CheckboxButton: FC<Omit<ButtonProps, 'onClick' | 'type'> & {
  defaultChecked?: boolean;
  checked?: boolean;
  checkedType?: ButtonProps["type"];
  uncheckedType?: ButtonProps["type"];
  onChange: CheckboxProps["onChange"];
}> = ({
  defaultChecked = false,
  checked,
  checkedType = 'primary',
  uncheckedType,
  onChange,
  ...spread }) => {
  const [uncontrolled, setUncontrolled] = useState(defaultChecked);
  const value = checked ?? uncontrolled;

  const onClick: ButtonProps["onClick"] = useCallback((e) => {
    const next = !value;
    const eWrap: CheckboxChangeEvent = {
      ...e,
      target: {
        ...e.target,
        checked: next,
      },
    };
    onChange?.(eWrap);
    if (checked === undefined) {
      setUncontrolled(next);
    }
  }, [checked, onChange, value]);

  return (
    <Button
      {...spread}
      type={value ? checkedType : uncheckedType}
      onClick={onClick}
    />
  );
};

export { CheckboxButton };
