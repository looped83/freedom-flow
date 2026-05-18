import { useEffect, useMemo, useRef, useState } from 'react';
import type { Goal, Portfolio } from '../../types';
import { CategoryIcon } from './CategoryIcon';
import { computeGoalResults, totalMonthlyCosts } from '../../utils/calculations';
import { formatEuro } from '../../utils/formatting';
import { saveGoalDefault } from '../../utils/storage';
import { useSwipeToDelete } from '../../hooks/useSwipeToDelete';
import { BONUS_GOAL_ID } from '../../constants/defaultData';
import { IconChevron, IconCheck, IconClose, IconTrash } from '../ui/Icons';
import { GoalForm } from './GoalForm';

const deCollator = new Intl.Collator('de');

type GoalFilter = 'all' | 'covered' | 'open';
type SortType  = 'alpha' | 'amount';

interface GoalListProps {
  goals: Goal[];
  portfolio: Portfolio;
  onAdd: (g: Goal) => void;
  onUpdate: (g: Goal) => void;
  onDelete: (id: string) => void;
  focusGoalId?: string | null;
  onFocusConsumed?: () => void;
}

export function GoalList({ goals, portfolio, onAdd, onUpdate, onDelete, focusGoalId, onFocusConsumed }: GoalListProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [goalFilter, setGoalFilter] = useState<GoalFilter>('all');
  const [goalSort, setGoalSort] = useState<{ type: SortType; dir: 'asc' | 'desc' }>({ type: 'amount', dir: 'desc' });

  const liRefs = useRef<Map<string, HTMLLIElement>>(new Map());

  useEffect(() => {
    if (!focusGoalId) return;
    setEditingId(focusGoalId);
    onFocusConsumed?.();
    const timer = setTimeout(() => {
      liRefs.current.get(focusGoalId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
    return () => clearTimeout(timer);
  }, [focusGoalId, onFocusConsumed]);

  const swipe = useSwipeToDelete(onDelete, { isLocked: (id) => editingId === id });

  const monthly = portfolio.monthlyIncome;
  const total = useMemo(() => totalMonthlyCosts(goals), [goals]);
  const allResults = useMemo(() => computeGoalResults(goals, monthly, portfolio), [goals, monthly, portfolio]);
  const displayResults = useMemo(() => {
    let results = [...allResults];
    if (goalFilter === 'covered') results = results.filter((r) => r.status === 'covered');
    else if (goalFilter === 'open') results = results.filter((r) => r.status !== 'covered');
    if (goalSort.type === 'alpha') {
      results.sort((a, b) => deCollator.compare(a.name, b.name));
      if (goalSort.dir === 'desc') results.reverse();
    } else {
      results.sort((a, b) => a.monthlyAmount - b.monthlyAmount);
      if (goalSort.dir === 'desc') results.reverse();
    }
    return results;
  }, [allResults, goalFilter, goalSort]);

  function handleSortChange(type: SortType) {
    setGoalSort((prev) => {
      if (prev.type === type) return { type, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
      return { type, dir: type === 'amount' ? 'desc' : 'asc' };
    });
  }

  function toggleEdit(id: string) {
    if (swipe.isSwipingRef.current) return;
    setEditingId((prev) => (prev === id ? null : id));
    setConfirmDelete(null);
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-6" aria-labelledby="goals-heading">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 id="goals-heading" className="text-xs text-white/55 mb-0.5 font-normal">Ausgaben / Monat</h2>
          <p className="text-xl font-bold text-white tabular-nums">{formatEuro(total)}</p>
        </div>
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="flex-shrink-0 bg-accent text-surface font-semibold px-4 py-2 rounded-xl text-sm hover:bg-accent-dim transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Neue Ausgabe hinzufügen"
        >
          + Ausgabe
        </button>
      </div>

      {/* Filter + sort controls */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex rounded-lg overflow-hidden border border-white/10" role="group" aria-label="Ziele filtern">
          {([
            { id: 'all',     label: 'Alle'     },
            { id: 'covered', label: 'Erreicht'  },
            { id: 'open',    label: 'Offen'    },
          ] as { id: GoalFilter; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setGoalFilter(id)}
              aria-pressed={goalFilter === id}
              className={`text-xs px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
                goalFilter === id ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg overflow-hidden border border-white/10" role="group" aria-label="Sortierung">
          <button
            onClick={() => handleSortChange('alpha')}
            aria-pressed={goalSort.type === 'alpha'}
            className={`text-xs px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              goalSort.type === 'alpha' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
            }`}
          >
            {goalSort.type === 'alpha' ? (goalSort.dir === 'asc' ? 'A–Z' : 'Z–A') : 'A–Z'}
          </button>
          <button
            onClick={() => handleSortChange('amount')}
            aria-pressed={goalSort.type === 'amount'}
            className={`text-xs px-3 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              goalSort.type === 'amount' ? 'bg-accent/20 text-accent font-semibold' : 'text-white/45 hover:text-white/70'
            }`}
          >
            {goalSort.type === 'amount' ? (goalSort.dir === 'desc' ? '↓ €' : '↑ €') : '↓↑ €'}
          </button>
        </div>
      </div>

      {adding && (
        <div className="bg-surface-1 rounded-2xl p-5 mb-4">
          <h2 className="text-sm font-semibold text-white mb-4">Neues Ziel</h2>
          <GoalForm
            onSave={(g) => { onAdd(g); setAdding(false); }}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {displayResults.length === 0 && !adding && (
        <p className="text-sm text-white/50 py-4 text-center">Keine Ausgaben in dieser Ansicht.</p>
      )}

      <ul className="space-y-2" role="list" aria-label="Zielliste">
        {displayResults.map((goal) => {
          const isEditing = editingId === goal.id;
          const isConfirmDelete = confirmDelete === goal.id;

          return (
            <li
              key={goal.id}
              className="rounded-xl relative overflow-hidden"
              ref={(el) => { if (el) liRefs.current.set(goal.id, el); else liRefs.current.delete(goal.id); }}
            >

              {/* Swipe-delete background – fades in as card slides left */}
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-end pr-5 bg-red-500 rounded-xl"
                style={{ opacity: 0 }}
                ref={(el) => swipe.setBgEl(goal.id, el)}
              >
                <IconTrash />
              </div>

              {/* Sliding card */}
              <div
                className="bg-surface-1 rounded-xl relative"
                ref={(el) => swipe.setCardEl(goal.id, el)}
                {...swipe.bind(goal.id)}
              >
                {/* ── Card header – tap to expand / collapse ── */}
                <div className={`flex items-center gap-3 px-4 py-3 ${isEditing ? 'border-b border-white/5' : ''}`}>
                  {/* Main tappable area */}
                  <button
                    onClick={() => toggleEdit(goal.id)}
                    aria-expanded={isEditing}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                  >
                    <span className={`flex-shrink-0 ${
                      goal.id === BONUS_GOAL_ID
                        ? 'text-orange-400'
                        : goal.status === 'covered'
                          ? 'text-accent'
                          : 'text-white/60'
                    }`} aria-hidden="true">
                      <CategoryIcon category={goal.category} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                        <span className="truncate">{goal.name}</span>
                        {goal.status === 'covered' && (
                          <>
                            <span className="sr-only">, erreicht</span>
                            <span className="text-accent flex-shrink-0" aria-hidden="true">
                              <IconCheck />
                            </span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-white/65 mt-0.5">{goal.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-white/80 tabular-nums pr-2">
                      {formatEuro(goal.monthlyAmount)}
                    </span>
                    <span className="sr-only">{isEditing ? '. Schließen' : '. Bearbeiten'}</span>
                    <IconChevron open={isEditing} />
                  </button>

                  {/* Delete button (desktop / non-swipe fallback) */}
                  {isConfirmDelete ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => { onDelete(goal.id); setConfirmDelete(null); }}
                        aria-label={`${goal.name} endgültig löschen`}
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
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(goal.id); setEditingId(null); }}
                      aria-label={`${goal.name} löschen`}
                      className="flex-shrink-0 p-1.5 text-white/35 hover:text-red-400 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                    >
                      <IconTrash />
                    </button>
                  )}
                </div>

                {/* ── Expandable edit form ── */}
                {isEditing && (
                  <div className="animate-slide-down px-4 pb-4 pt-3">
                    <GoalForm
                      initial={goal}
                      onSave={(g) => { onUpdate(g); setEditingId(null); }}
                      onSaveAsDefault={saveGoalDefault}
                      onCancel={() => setEditingId(null)}
                    />
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
