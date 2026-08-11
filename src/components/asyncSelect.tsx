import { memo, useCallback, useState } from 'react';
import { Select, type SelectProps } from 'antd';

type AsyncSelectProps<ValueType = unknown> = Omit<SelectProps<ValueType>, 'onChange' | 'loading'> & {
  onChange?: (
    value: ValueType,
    option: Parameters<NonNullable<SelectProps<ValueType>['onChange']>>[1],
  ) => void | Promise<unknown>;
};

function AsyncSelectInner<ValueType = unknown>({
  onChange,
  ...props
}: AsyncSelectProps<ValueType>) {
  const [isLoading, setLoading] = useState(false);

  const handleChange = useCallback(
    (
      value: ValueType,
      option: Parameters<NonNullable<SelectProps<ValueType>['onChange']>>[1],
    ) => {
      if (onChange === undefined) return;
      const result = onChange(value, option);
      if (result instanceof Promise) {
        setLoading(true);
        result.finally(() => setLoading(false));
      }
    },
    [onChange],
  );

  return <Select<ValueType> {...props} onChange={handleChange} loading={isLoading} />;
}

const AsyncSelect = memo(AsyncSelectInner) as typeof AsyncSelectInner;

export { AsyncSelect };
