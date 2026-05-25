import { useCallback, useMemo, useState } from "react";

import type { StoreCardMatch } from "@/types/models";
import { hapticLight } from "@/utils/haptics";

export function useCompareCards(cards: StoreCardMatch[] = []) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [compareOpen, setCompareOpen] = useState(false);

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onToggleMode = useCallback((enabled: boolean) => {
    setCompareMode(enabled);
    setSelectedIds(new Set());
  }, []);

  const openCompare = useCallback(() => {
    hapticLight();
    setCompareOpen(true);
  }, []);

  const closeCompare = useCallback(() => {
    setCompareOpen(false);
  }, []);

  const selectedCards = useMemo(
    () => cards.filter((c) => selectedIds.has(c.card_id)),
    [cards, selectedIds]
  );

  return {
    compareMode,
    selectedIds,
    compareOpen,
    selectedCards,
    toggleSelect,
    onToggleMode,
    openCompare,
    closeCompare,
  };
}
