import * as Crypto from "expo-crypto";
import { useRef } from "react";

export function useIdempotencyKey() {
  const keyRef = useRef<string | null>(null);

  const getKey = () => {
    if (!keyRef.current) {
      keyRef.current = Crypto.randomUUID();
    }
    return keyRef.current;
  };

  const resetKey = () => {
    keyRef.current = null;
  };

  return { getKey, resetKey };
}
