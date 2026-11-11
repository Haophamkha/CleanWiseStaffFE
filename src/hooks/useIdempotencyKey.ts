import { uuid } from "expo";
import { useRef } from "react";

export function useIdempotencyKey() {
  const keyRef = useRef<string | null>(null);

  const getKey = () => {
    if (!keyRef.current) {
      keyRef.current = uuid.v4();
    }
    return keyRef.current;
  };

  const resetKey = () => {
    keyRef.current = null;
  };

  return { getKey, resetKey };
}
