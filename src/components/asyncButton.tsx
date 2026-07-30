import { type FC, memo, type MouseEventHandler, useCallback, useEffect, useState } from 'react';
import { Button, type ButtonProps } from 'antd';

const AsyncButton: FC<
  Omit<ButtonProps, 'onClick' | 'loading' | 'disabled'> & {
    onClick?: (event: Parameters<MouseEventHandler<unknown>>[0]) => Promise<unknown>;
    disabled?: boolean | (() => Promise<boolean>);
  }
> = memo(({ onClick, disabled, ...props }) => {
  const [isLoading, setLoading] = useState(false);
  const onStart = useCallback(
    async (e: Parameters<MouseEventHandler<unknown>>[0]) => {
      if (onClick === undefined) {
        return;
      }
      const clicked = onClick(e);
      if (clicked instanceof Promise) {
        clicked.finally(() => setLoading(false));
        setLoading(true);
      }
    },
    [onClick]
  );
  const [disabledValue, setDisabled] = useState<boolean | undefined>(typeof disabled === 'function' ? undefined : (disabled ?? false));
  useEffect(() => {
    if (typeof disabled === 'function') {
      disabled().then(setDisabled);
    } else if (disabled !== undefined) {
      setDisabled(disabled);
    }
  }, [disabled, isLoading]);
  return <Button {...props} onClick={onStart} loading={isLoading || disabledValue === undefined} disabled={disabledValue ?? false} />;
});

export { AsyncButton };
