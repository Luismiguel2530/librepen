import { useCallback, useMemo, useSyncExternalStore } from "react";

function useMediaQuery(query) {
  const mediaQuery = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return window.matchMedia(query);
  }, [query]);

  const subscribe = useCallback(
    (onStoreChange) => {
      if (!mediaQuery) {
        return () => {};
      }

      mediaQuery.addEventListener("change", onStoreChange);

      return () => {
        mediaQuery.removeEventListener("change", onStoreChange);
      };
    },
    [mediaQuery],
  );

  const getSnapshot = useCallback(
    () => mediaQuery?.matches ?? false,
    [mediaQuery],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export default useMediaQuery;
