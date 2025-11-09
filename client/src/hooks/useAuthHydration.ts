import { useEffect, useState } from "react";
import useAuthStore from "../store/useAuthStore";

const useAuthHydration = () => {
  const persist = useAuthStore.persist;
  const [hydrated, setHydrated] = useState(persist.hasHydrated());

  useEffect(() => {
    const unsubscribeHydrate = persist.onHydrate?.(() => setHydrated(false));
    const unsubscribeFinish = persist.onFinishHydration?.(() => setHydrated(true));

    // Ensure we have the latest value once effect runs on client
    setHydrated(persist.hasHydrated());

    return () => {
      unsubscribeHydrate?.();
      unsubscribeFinish?.();
    };
  }, [persist]);

  return hydrated;
};

export default useAuthHydration;
