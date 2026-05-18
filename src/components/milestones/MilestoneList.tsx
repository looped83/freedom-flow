import { useMemo, useState } from 'react';
import type { Goal, Milestone, MilestoneResult, Portfolio } from '../../types';
import { formatEuro } from '../../utils/formatting';
import { computeMilestoneResults, filterMilestonesByExpenses, formatDaysRemaining, formatMilestoneDate, milestoneSortKey } from '../../utils/milestones';
import { useSwipeToDelete } from '../../hooks/useSwipeToDelete';
import { IconChevron, IconCheck, IconClose, IconTrash } from '../ui/Icons';
import { MilestoneIcon } from './MilestoneIcon';
import { MilestoneForm } from './MilestoneForm';

const deCollator = new Intl.Collator('de');

type MilestoneFilter = 'all' | 'achieved' | 'open';
type SortType = 'alpha' | 'target' | 'status';

interface MilestoneListProps {
  milestones: Milestone[];
  goals: Goal[];
  portfolio: Portfolio;
  onAdd: (m: Milestone) => void;
  onUpdate: (m: Milestone) => void;
  onDelete: (id: string) => void;
}

function MilestoneSubtitle({ result }: { result: MilestoneResult }) {
  if (result.type === 'dividend') {
    if (result.status === 'achieved') return null;
    return <>noch {formatEuro(result.missingMonthly)}</>;
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

export function MilestoneList({ milestones, goals, portfolio, onAdd, onUpdate, onDelete }: MilestoneListProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<MilestoneFilter>('all');
  const [sort, setSort] = useState<{ type: SortType; dir: 'asc' | 'desc' }>({ type: 'target', dir: 'desc' });

  const swipe = useSwipeToDelete(onDelete, { isLocked: (id) => editingId === id });

  const visibleMilestones = useMemo(
    () => filterMilestonesByExpenses(milestones, goals),
    [milestones, goals],
  );

  const allResults = useMemo(() => computeMilestoneResults(visibleMilestones, portfolio), [visibleMilestones, portfolio]);

  const achievedCount = useMemo(
    () => allResults.reduce((n, r) => (r.status === 'achieved' ? n + 1 : n), 0),
    [allResults],
  );

  const displayResults = useMemo(() => {
    const filtered =
      filter === 'achieved' ? allResults.filter((r) => r.status === 'achieved')
      : filter === 'open'   ? allResults.filter((r) => r.status !== 'achieved')
      : allResults.slice();

    const compare =
      sort.type === 'alpha'  ? (a: MilestoneResult, b: MilestoneResult) => deCollator.compare(a.title, b.title)
      : sort.type === 'target' ? (a: MilestoneResult, b: MilestoneResult) => milestoneSortKey(a) - milestoneSortKey(b)
      : (a: MilestoneResult, b: MilestoneResult) => {
          if (a.status !== b.status) return a.status === 'open' ? -1 : 1;
          if (a.status === 'open') return b.progressPercent - a.progressPercent;
          return milestoneSortKey(a) - milestoneSortKey(b);
        };

    filtered.sort(compare);
    if (sort.dir === 'desc') filtered.reverse();
    return filtered;
  }, [allResults, filter, sort]);

  const totalCount = visibleMilestones.length;

  function handleSortChange(type: SortType) {
    setSort((prev) => {
      if (prev.type === type) return { type, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { type, dir: type === 'target' ? 'desc' : 'asc' };
    });
  }

  function toggleEdit(id: string) {
    if (swipe.isSwipingRef.current) return;
    setEditingId((prev) => (prev === id ? null : id));
    setConfirmDelete(null);
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-6" aria-labelledby="milestones-heading">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="milestones-heading" className="text-xs text-white/55 mb-0.5 font-normal">Meilensteine</h2>
          <p className="text-xl font-bold text-white tabular-nums">
            {totalCount}
            {totalCount > 0 && (
              <span className="text-sm font-medium text-white/55 ml-2">
                {achievedCount}/{totalCount} erreicht
              </span>
            )}
          </p>
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
                filter === id ? 'bg-accent/20 text-accent font-semibold' : 'text-white/55 hover:text-white/80'
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
              sort.type === 'alpha' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/55 hover:text-white/80'
            }`}
          >
            {sort.type === 'alpha' ? (sort.dir === 'asc' ? 'A–Z' : 'Z–A') : 'A–Z'}
          </button>
          <button
            onClick={() => handleSortChange('status')}
            aria-pressed={sort.type === 'status'}
            className={`text-xs px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              sort.type === 'status' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/55 hover:text-white/80'
            }`}
          >
            Status
          </button>
          <button
            onClick={() => handleSortChange('target')}
            aria-pressed={sort.type === 'target'}
            className={`text-xs px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              sort.type === 'target' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/55 hover:text-white/80'
            }`}
          >
            {sort.type === 'target' ? (sort.dir === 'desc' ? '↓ Ziel' : '↑ Ziel') : '↓↑ Ziel'}
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
          const achieved = m.status === 'achieved';

          return (
            <li
              key={m.id}
              className="rounded-xl relative overflow-hidden"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-end pr-5 bg-red-500 rounded-xl"
                style={{ opacity: 0 }}
                ref={(el) => swipe.setBgEl(m.id, el)}
              >
                <IconTrash />
              </div>

              <div
                className="bg-surface-1 rounded-xl relative"
                ref={(el) => swipe.setCardEl(m.id, el)}
                {...swipe.bind(m.id)}
              >
                <div className={`flex items-center gap-3 px-4 py-3 ${isEditing ? 'border-b border-white/5' : ''}`}>
                  <button
                    onClick={() => toggleEdit(m.id)}
                    aria-expanded={isEditing}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                  >
                    <span className={`flex-shrink-0 ${achieved ? 'text-accent' : 'text-white/60'}`} aria-hidden="true">
                      <MilestoneIcon icon={m.icon} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                        {m.title}
                        {achieved && (
                          <>
                            <span className="sr-only">, erreicht</span>
                            <span className="text-accent" aria-hidden="true">
                              <IconCheck />
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-white/65 mt-0.5 truncate">
                        <MilestoneSubtitle result={m} />
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-white/80 tabular-nums pr-2">
                      <MilestoneRightValue result={m} />
                    </span>
                    <span className="sr-only">{isEditing ? '. Schließen' : '. Bearbeiten'}</span>
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
                        <IconClose />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(m.id); setEditingId(null); }}
                      aria-label={`${m.title} löschen`}
                      className="flex-shrink-0 p-1.5 text-white/55 hover:text-red-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                    >
                      <IconTrash />
                    </button>
                  )}
                </div>

                {isEditing && (
                  <div className="animate-slide-down">
                    <div className="px-4 pb-4 pt-3">
                      <MilestoneForm
                        initial={m}
                        onSave={(saved) => { onUpdate(saved); setEditingId(null); }}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
