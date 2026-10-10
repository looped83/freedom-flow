import { useCallback, useEffect, useRef, useState } from 'react';
import { useSwipeToDelete } from './useSwipeToDelete';
import type { SortState } from '../components/ui/SegmentedControl';

export type ListFilter = 'all' | 'achieved' | 'open';
export type ListSort = 'name' | 'amount';

/**
 * UI state of an editable Setup list (Ausgaben, Meilensteine): add form,
 * expanded row, filter, sort, swipe-to-delete, and scroll-to-row when the
 * Dashboard deep-links into an entry.
 */
export function useEditableList(onDelete: (id: string) => void, focusId?: string | null, onFocusConsumed?: () => void) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ListFilter>('all');
  const [sort, setSort] = useState<SortState<ListSort>>({ type: 'amount', dir: 'desc' });
  const rowEls = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    if (!focusId) return;
    setAdding(false);
    setEditingId(focusId);
    // Wait for the tab switch / lazy mount to settle before scrolling.
    const timer = setTimeout(() => {
      rowEls.current.get(focusId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onFocusConsumed?.();
    }, 350);
    return () => clearTimeout(timer);
  }, [focusId, onFocusConsumed]);

  const swipe = useSwipeToDelete(onDelete, { isLocked: (id) => editingId === id });

  const setRowEl = useCallback((id: string, el: HTMLElement | null) => {
    if (el) rowEls.current.set(id, el);
    else rowEls.current.delete(id);
  }, []);

  function toggle(id: string) {
    if (swipe.isSwipingRef.current) return;
    setAdding(false);
    setEditingId((prev) => (prev === id ? null : id));
  }

  function startAdding() {
    setEditingId(null);
    setAdding(true);
  }

  function close() {
    setAdding(false);
    setEditingId(null);
  }

  return { adding, editingId, filter, setFilter, sort, setSort, swipe, setRowEl, toggle, startAdding, close };
}

export type EditableList = ReturnType<typeof useEditableList>;
