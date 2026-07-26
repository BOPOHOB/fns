import { type DependencyList, useEffect, useState } from 'react';

type Disposable = object & {
  destructor?: () => void;
};

function useModel<T extends Disposable>(creator: () => T, deps: DependencyList = []): T | null {
  const [model, setModel] = useState<T | null>(null);
  useEffect(() => {
    const instance = creator();
    setModel(instance);
    return instance.destructor;
  }, deps);
  return model;
}

export { useModel };
