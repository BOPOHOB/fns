import { type FC, memo, useCallback, useEffect, useState } from 'react';
import { Switch, type SwitchProps } from 'antd';

type SwitchChangeEvent = Parameters<NonNullable<SwitchProps['onChange']>>[1];

const AsyncSwitch: FC<
  Omit<SwitchProps, 'onChange' | 'loading' | 'disabled'> & {
    onChange?: (checked: boolean, event: SwitchChangeEvent) => Promise<unknown> | void;
    disabled?: boolean | (() => Promise<boolean>);
  }
> = memo(({ onChange, disabled, ...props }) => {
  const [isLoading, setLoading] = useState(false);
  const handleChange = useCallback(
    (checked: boolean, event: SwitchChangeEvent) => {
      if (onChange === undefined) return;
      const result = onChange(checked, event);
      if (result instanceof Promise) {
        setLoading(true);
        result.finally(() => setLoading(false));
      }
    },
    [onChange],
  );
  const [disabledValue, setDisabled] = useState<boolean | undefined>(
    typeof disabled === 'function' ? undefined : (disabled ?? false),
  );
  useEffect(() => {
    if (typeof disabled === 'function') {
      disabled().then(setDisabled);
    } else if (disabled !== undefined) {
      setDisabled(disabled);
    }
  }, [disabled, isLoading]);

  return (
    <Switch
      {...props}
      onChange={handleChange}
      loading={isLoading || disabledValue === undefined}
      disabled={disabledValue ?? false}
    />
  );
});

export { AsyncSwitch };
