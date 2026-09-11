import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(
        !!state.isConnected && state.isInternetReachable !== false,
      );
    });
    return () => unsubscribe();
  }, []);

  return isConnected;
}
