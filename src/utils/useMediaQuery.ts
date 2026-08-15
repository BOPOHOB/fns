import { useSyncExternalStore } from "react";

const useMediaQuery = (query: string) =>
  useSyncExternalStore(
    (onStoreChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onStoreChange);
      return () => mql.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );

export { useMediaQuery };
