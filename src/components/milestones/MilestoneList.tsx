import { useMemo, useRef, useState } from 'react';
import type { Milestone, MilestoneResult, Portfolio } from '../../types';
import { formatEuro } from '../../utils/formatting';
import { computeMilestoneResults, formatDaysRemaining, formatMilestoneDate } from '../../utils/milestones';
import { MilestoneIcon } from './MilestoneIcon';
import { MilestoneForm } from './MilestoneForm';

type MilestoneFilter = 'all' | 'achieved' | 'open';
type SortType = 'alpha' | 'target' | 'status';

interface MilestoneListProps {
  milestones: Milestone[];
  portfolio: Portfolio;
  onAdd: (m: Milestone) => void;
  onUpdate: (m: Milestone) => void;
  onDelete: (id: string) => void;
}

const SWIPE_DELETE_PX = 160;

function IconTrash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

function sortKey(r: MilestoneResult): number {
  if (r.type === 'dividend') return r.dividendTarget ?? 0;
  if (r.dateTarget) {
    const t = new Date(r.dateTarget).getTime();
    return isNaN(t) ? 0 : t / 1000;
  }
  return 0;
}

function MilestoneSubtitle({ result }: { result: MilestoneResult }) {
  if (result.type === 'dividend') {
    const target = result.dividendTarget ?? 0;
    if (result.status === 'achieved') {
      return <>Ziel: {formatEuro(target)} / Monat · Erreicht</>;
    }
    return (
      <>
        Ziel: {formatEuro(target)} / Monat · noch {formatEuro(result.missingMonthly)}
      </>
    );
  }
  if (!result.dateTarget) return <>Zeitziel</>;
  return (
    <>
      {formatMilestoneDate(result.dateTarget)} · {result.daysRemaining != null ? formatDaysRemaining(result.daysRemaining) : ''}
    </>
  );
}

function MilestoneRightValue({ result }: { result: MilestoneResult }) {
  if (result.type === 'dividend') {
    return <>{formatEuro(result.dividendTarget ?? 0)}</>;
  }
  if (result.dateTarget) return <>{formatMilestoneDate(result.dateTarget)}</>;
  return null;
}

export function MilestoneList({ milestones, portfolio, onAdd, onUpdate, onDelete }: MilestoneListProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<MilestoneFilter>('all');
  const [sort, setSort] = useState<{ type: SortType; dir: 'asc' | 'desc' }>({ type: 'status', dir: 'asc' });

  const touchRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    determined: boolean;
    isHorizontal: boolean;
  } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<{ id: string; px: number } | null>(null);

  const allResults = useMemo(() => computeMilestoneResults(milestones, portfolio), [milestones, portfolio]);

  const displayResults = useMemo(() => {
    let results = [...allResults];
    if (filter === 'achieved') results = results.filter((r) => r.status === 'achieved');
    else if (filter === 'open') results = results.filter((r) => r.status !== 'achieved');

    if (sort.type === 'alpha') {
      results.sort((a, b) => a.title.localeCompare(b.title, 'de'));
      if (sort.dir === 'desc') results.reverse();
    } else if (sort.type === 'target') {
      results.sort((a, b) => sortKey(a) - sortKey(b));
      if (sort.dir === 'desc') results.reverse();
    } else {
      // status: open (closest to achieving) first, then achieved; tiebreak by sortKey asc
      results.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
        if (a.status === 'open') return b.progressPercent - a.progressPercent;
        return sortKey(a) - sortKey(b);
      });
      if (sort.dir === 'desc') results.reverse();
    }
    return results;
  }, [allResults, filter, sort]);

  const totalCount = milestones.length;
  const achievedCount = allResults.filter((r) => r.status === 'achieved').length;

  function handleSortChange(type: SortType) {
    setSort((prev) => {
      if (prev.type === type) return { type, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { type, dir: type === 'target' ? 'desc' : 'asc' };
    });
  }

  function toggleEdit(id: string) {
    if (swipeOffset) return;
    setEditingId((prev) => (prev === id ? null : id));
    setConfirmDelete(null);
  }

  function onTouchStart(e: React.TouchEvent, id: string) {
    if (editingId === id) return;
    const t = e.touches[0];
    touchRef.current = { id, startX: t.clientX, startY: t.clientY, determined: false, isHorizontal: false };
  }

  function onTouchMove(e: React.TouchEvent, id: string) {
    const ref = touchRef.current;
    if (!ref || ref.id !== id) return;
    const t = e.touches[0];
    const dx = t.clientX - ref.startX;
    const dy = t.clientY - ref.startY;
    if (!ref.determined && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      ref.isHorizontal = Math.abs(dx) > Math.abs(dy);
      ref.determined = true;
    }
    if (!ref.isHorizontal) return;
    const px = Math.min(0, dx);
    setSwipeOffset({ id, px });
  }

  function onTouchEnd(id: string) {
    if (!touchRef.current || touchRef.current.id !== id) return;
    const wasHorizontal = touchRef.current.isHorizontal;
    touchRef.current = null;
    const px = swipeOffset?.id === id ? swipeOffset.px : 0;
    setSwipeOffset(null);
    if (wasHorizontal && px <= -SWIPE_DELETE_PX) onDelete(id);
  }

  function getCardStyle(id: string): React.CSSProperties {
    const px = swipeOffset?.id === id ? swipeOffset.px : 0;
    return {
      transform: `translateX(${px}px)`,
      transition: swipeOffset?.id === id ? 'none' : 'transform 0.22s ease-out',
    };
  }

  function getDeleteBgOpacity(id: string): number {
    const px = swipeOffset?.id === id ? Math.abs(swipeOffset.px) : 0;
    return Math.min(1, px / SWIPE_DELETE_PX);
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-white/55 mb-0.5">Meilensteine</p>
          <h1 className="text-xl font-bold text-white tabular-nums">
            {totalCount}
            {totalCount > 0 && (
              <span className="text-sm font-medium text-white/55 ml-2">
                {achievedCount}/{totalCount} erreicht
              </span>
            )}
          </h1>
        </div>
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="flex-shrink-0 bg-accent text-surface font-semibold px-4 py-2 rounded-xl text-sm hover:bg-accent-dim transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Neuen Meilenstein hinzufügen"
        >
          + Meilenstein
        </button>
      </div>

      {/* Filter + sort controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex rounded-lg overflow-hidden border border-white/10" role="group" aria-label="Meilensteine filtern">
          {([
            { id: 'all',      label: 'Alle'     },
            { id: 'achieved', label: 'Erreicht' },
            { id: 'open',     label: 'Offen'    },
          ] as { id: MilestoneFilter; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={`text-xs px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                filter === id ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg overflow-hidden border border-white/10" role="group" aria-label="Sortierung">
          <button
            onClick={() => handleSortChange('alpha')}
            aria-pressed={sort.type === 'alpha'}
            className={`text-xs px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              sort.type === 'alpha' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
            }`}
          >
            {sort.type === 'alpha' ? (sort.dir === 'asc' ? 'A–Z' : 'Z–A') : 'A–Z'}
          </button>
          <button
            onClick={() => handleSortChange('target')}
            aria-pressed={sort.type === 'target'}
            className={`text-xs px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              sort.type === 'target' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
            }`}
          >
            {sort.type === 'target' ? (sort.dir === 'desc' ? '↓ Ziel' : '↑ Ziel') : '↓↑ Ziel'}
          </button>
          <button
            onClick={() => handleSortChange('status')}
            aria-pressed={sort.type === 'status'}
            className={`text-xs px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              sort.type === 'status' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
            }`}
          >
            Status
          </button>
        </div>
      </div>

      {adding && (
        <div className="bg-surface-1 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-4">Neuer Meilenstein</h2>
          <MilestoneForm
            onSave={(m) => { onAdd(m); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {displayResults.length === 0 && !adding && (
        <p className="text-sm text-white/50 py-4 text-center">
          {totalCount === 0 ? 'Noch keine Meilensteine. Lege deinen ersten an.' : 'Keine Meilensteine in dieser Ansicht.'}
        </p>
      )}

      <ul className="space-y-2" role="list" aria-label="Meilensteinliste">
        {displayResults.map((m) => {
          const isEditing = editingId === m.id;
          const isConfirmDelete = confirmDelete === m.id;
          const opacity = getDeleteBgOpacity(m.id);
          const achieved = m.status === 'achieved';

          return (
            <li
              key={m.id}
              className="rounded-xl relative overflow-hidden"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-end pr-5 bg-red-500 rounded-xl"
                style={{ opacity }}
              >
                <IconTrash />
              </div>

              <div
                className="bg-surface-1 rounded-xl relative"
                style={getCardStyle(m.id)}
                onTouchStart={(e) => onTouchStart(e, m.id)}
                onTouchMove={(e) => onTouchMove(e, m.id)}
                onTouchEnd={() => onTouchEnd(m.id)}
              >
                <div className={`flex items-center gap-3 px-4 py-3 ${isEditing ? 'border-b border-white/5' : ''}`}>
                  <button
                    onClick={() => toggleEdit(m.id)}
                    aria-expanded={isEditing}
                    aria-label={`${m.title} ${isEditing ? 'schließen' : 'bearbeiten'}`}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                  >
                    <span className={`flex-shrink-0 ${achieved ? 'text-accent' : 'text-white/60'}`}>
                      <MilestoneIcon icon={m.icon} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                        {m.title}
                        {achieved && (
                          <span aria-label="erreicht" className="text-accent">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-white/65 mt-0.5 truncate">
                        <MilestoneSubtitle result={m} />
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-white/80 tabular-nums pr-2">
                      <MilestoneRightValue result={m} />
                    </span>
                    <IconChevron open={isEditing} />
                  </button>

                  {isConfirmDelete ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => { onDelete(m.id); setConfirmDelete(null); }}
                        aria-label={`${m.title} endgültig löschen`}
                        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                      >
                        Löschen
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        aria-label="Abbrechen"
                        className="p-1.5 text-white/50 hover:text-white/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5" aria-hidden="true">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(m.id); setEditingId(null); }}
                      aria-label={`${m.title} löschen`}
                      className="flex-shrink-0 p-1.5 text-white/35 hover:text-red-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                    >
                      <IconTrash />
                    </button>
                  )}
                </div>

                {isEditing && (
                  <div className="animate-slide-down px-4 pb-4 pt-3">
                    <MilestoneForm
                      initial={m}
                      onSave={(saved) => { onUpdate(saved); setEditingId(null); }}
                      onCancel={() => setEditingId(null)}
                    />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
