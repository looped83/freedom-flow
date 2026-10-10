import type { ReactNode } from 'react';
import type { EditableList, ListFilter, ListSort } from '../../hooks/useEditableList';
import { deCollator } from '../../utils/locale';
import { SegmentedControl, SortControl, type SortState } from './SegmentedControl';
import { IconChevron, IconTrash } from './Icons';

// ── Header ──────────────────────────────────────────────────────────────────

interface ListHeaderProps {
  id: string;
  label: string;
  value: string;
  meta?: string;
  addLabel: string;
  onAdd: () => void;
}

export function ListHeader({ id, label, value, meta, addLabel, onAdd }: ListHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 id={id} className="text-xs text-white/70">{label}</h2>
        <p className="text-xl font-bold tabular-nums text-white">
          {value}
          {meta && <span className="ml-2 text-sm font-medium text-white/50">{meta}</span>}
        </p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="flex-shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface transition-colors hover:bg-accent-dim"
      >
        + {addLabel}
      </button>
    </div>
  );
}

// ── Toolbar: filter + sort ──────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { id: 'all',      label: 'Alle'     },
  { id: 'achieved', label: 'Erreicht' },
  { id: 'open',     label: 'Offen'    },
] as const;

const SORT_OPTIONS = [
  { id: 'name',   label: 'Name',   defaultDir: 'asc'  },
  { id: 'amount', label: 'Betrag', defaultDir: 'desc' },
] as const;

export function ListToolbar({ list, filterLabel }: { list: EditableList; filterLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <SegmentedControl ariaLabel={filterLabel} options={FILTER_OPTIONS} value={list.filter} onChange={list.setFilter} />
      <SortControl options={SORT_OPTIONS} value={list.sort} onChange={list.setSort} />
    </div>
  );
}

/** Apply the toolbar's filter + sort to any list of entries. */
export function applyListView<T>(
  items: readonly T[],
  filter: ListFilter,
  sort: SortState<ListSort>,
  get: { achieved: (item: T) => boolean; name: (item: T) => string; amount: (item: T) => number },
): T[] {
  const out = filter === 'all' ? items.slice() : items.filter((i) => get.achieved(i) === (filter === 'achieved'));
  const cmp = sort.type === 'name'
    ? (a: T, b: T) => deCollator.compare(get.name(a), get.name(b))
    : (a: T, b: T) => get.amount(a) - get.amount(b);
  return out.sort(sort.dir === 'asc' ? cmp : (a, b) => cmp(b, a));
}

// ── Row ─────────────────────────────────────────────────────────────────────

interface ListRowProps {
  id: string;
  list: EditableList;
  icon: ReactNode;
  achieved: boolean;
  title: string;
  subtitle: string;
  value: string;
  /** Edit form, rendered while the row is expanded. */
  children: ReactNode;
}

/** Tap to expand the edit form, swipe left to delete. */
export function ListRow({ id, list, icon, achieved, title, subtitle, value, children }: ListRowProps) {
  const expanded = list.editingId === id;
  return (
    <li ref={(el) => list.setRowEl(id, el)} className="relative scroll-mt-4 overflow-hidden rounded-xl">
      <div
        aria-hidden="true"
        ref={(el) => list.swipe.setBgEl(id, el)}
        className="absolute inset-0 flex items-center justify-end bg-red-500 pr-5 opacity-0"
      >
        <IconTrash />
      </div>
      <div ref={(el) => list.swipe.setCardEl(id, el)} {...list.swipe.bind(id)} className="relative bg-surface-1">
        <button
          type="button"
          onClick={() => list.toggle(id)}
          aria-expanded={expanded}
          className="focus-inset flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <span className={`flex-shrink-0 ${achieved ? 'text-accent' : 'text-white/50'}`}>{icon}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-white">{title}</span>
            <span className={`mt-0.5 block truncate text-xs ${achieved ? 'text-accent' : 'text-white/50'}`}>{subtitle}</span>
          </span>
          <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-white/70">{value}</span>
          <IconChevron open={expanded} className="w-4 h-4 text-white/50" />
        </button>
        {expanded && (
          <div className="animate-slide-down border-t border-white/5 px-4 pb-4 pt-3">{children}</div>
        )}
      </div>
    </li>
  );
}

/** Card wrapping the "new entry" form above a list. */
export function AddPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="animate-slide-down rounded-2xl border border-white/5 bg-surface-1 p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}
