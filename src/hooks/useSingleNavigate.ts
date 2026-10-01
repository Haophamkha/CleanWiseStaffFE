import { useCallback, useRef } from "react";

export function useSingleNavigate(lockMs = 800) {
  const lockedRef = useRef(false);

  return useCallback(
    (action: () => void) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      action();
      setTimeout(() => {
        lockedRef.current = false;
      }, lockMs);
    },
    [lockMs],
  );
}
