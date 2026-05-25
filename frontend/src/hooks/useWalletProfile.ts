import { useCallback, useEffect, useState } from "react";

import {
  DEFAULT_WALLET_PROFILE,
  loadWalletProfile,
  updateWalletProfile,
  type WalletProfile,
} from "@/services/wallet";

export function useWalletProfile() {
  const [profile, setProfile] = useState<WalletProfile>(DEFAULT_WALLET_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    const p = await loadWalletProfile();
    setProfile(p);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const patch = useCallback(async (next: Partial<WalletProfile>) => {
    const updated = await updateWalletProfile(next);
    setProfile(updated);
    return updated;
  }, []);

  return { profile, isLoading, reload, patch };
}
