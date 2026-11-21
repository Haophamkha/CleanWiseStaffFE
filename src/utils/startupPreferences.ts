import AsyncStorage from "@react-native-async-storage/async-storage";

// Start both reads together, even though the providers mount one after another.
// A stalled preferences store must not keep the native splash visible forever.
let pending: Promise<readonly [string | null, string | null]> | undefined;
export function readStartupPreferences() {
  if (!pending) {
    pending = new Promise<readonly [string | null, string | null]>((resolve) => {
      const timeout = setTimeout(() => resolve([null, null]), 2000);
      void Promise.all([
        AsyncStorage.getItem("cleanwise_staff_language").catch(() => null),
        AsyncStorage.getItem("cleanwise_staff_appearance").catch(() => null),
      ]).then(resolve, () => resolve([null, null])).finally(() => clearTimeout(timeout));
    });
  }
  return pending;
}
