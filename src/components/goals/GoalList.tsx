import { useRef, useState } from 'react';
import type { Goal } from '../../types';
import { totalMonthlyCosts } from '../../utils/calculations';
import { formatEuro } from '../../utils/formatting';
import { saveGoalDefault } from '../../utils/storage';
import { GoalForm } from './GoalForm';

interface GoalListProps {
  goals: Goal[];
  onAdd: (g: Goal) => void;
  onUpdate: (g: Goal) => void;
  onDelete: (id: string) => void;
}

const SWIPE_DELETE_PX = 160;

function sortDesc(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => b.monthlyAmount - a.monthlyAmount);
}

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

export function GoalList({ goals, onAdd, onUpdate, onDelete }: GoalListProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Swipe state – only one item can be actively swiped at a time
  const touchRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    determined: boolean;
    isHorizontal: boolean;
  } | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<{ id: string; px: number } | null>(null);

  const sorted = sortDesc(goals);
  const total = totalMonthlyCosts(goals);

  function toggleEdit(id: string) {
    // Ignore if we just finished a swipe gesture
    if (swipeOffset) return;
    setEditingId((prev) => (prev === id ? null : id));
    setConfirmDelete(null);
  }

  // ── swipe handlers ──────────────────────────────────────────────────────────

  function onTouchStart(e: React.TouchEvent, id: string) {
    if (editingId === id) return; // don't swipe while form is open
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

    const px = Math.min(0, dx); // only left
    setSwipeOffset({ id, px });
  }

  function onTouchEnd(id: string) {
    if (!touchRef.current || touchRef.current.id !== id) return;
    const wasHorizontal = touchRef.current.isHorizontal;
    touchRef.current = null;

    const px = swipeOffset?.id === id ? swipeOffset.px : 0;
    setSwipeOffset(null);

    if (wasHorizontal && px <= -SWIPE_DELETE_PX) {
      onDelete(id);
    }
    // else: snap back (swipeOffset cleared above)
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

  // ────────────────────────────────────────────────────────────────────────────

  return (
    <main className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white">Deine Ziele</h1>
          <p className="text-sm text-white/65 mt-1">Gesamt: {formatEuro(total)} / Monat</p>
        </div>
        <button
          onClick={() => { setAdding(true); setEditingId(null); }}
          className="flex-shrink-0 bg-accent text-surface font-semibold px-4 py-2 rounded-xl text-sm hover:bg-accent-dim transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          aria-label="Neues Ziel hinzufügen"
        >
          + Ziel
        </button>
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

      <ul className="space-y-2" role="list" aria-label="Zielliste">
        {sorted.map((goal) => {
          const isEditing = editingId === goal.id;
          const isConfirmDelete = confirmDelete === goal.id;
          const opacity = getDeleteBgOpacity(goal.id);

          return (
            <li key={goal.id} className="rounded-xl relative overflow-hidden">

              {/* Swipe-delete background – fades in as card slides left */}
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-end pr-5 bg-red-500 rounded-xl"
                style={{ opacity }}
              >
                <IconTrash />
              </div>

              {/* Sliding card */}
              <div
                className="bg-surface-1 rounded-xl relative"
                style={getCardStyle(goal.id)}
                onTouchStart={(e) => onTouchStart(e, goal.id)}
                onTouchMove={(e) => onTouchMove(e, goal.id)}
                onTouchEnd={() => onTouchEnd(goal.id)}
              >
                {/* ── Card header – tap to expand / collapse ── */}
                <div className={`flex items-center gap-3 px-4 py-3 ${isEditing ? 'border-b border-white/5' : ''}`}>
                  {/* Main tappable area */}
                  <button
                    onClick={() => toggleEdit(goal.id)}
                    aria-expanded={isEditing}
                    aria-label={`${goal.name} ${isEditing ? 'schließen' : 'bearbeiten'}`}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent rounded"
                  >
                    <span className="text-xl flex-shrink-0" aria-hidden="true">{goal.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{goal.name}</p>
                      <p className="text-xs text-white/65 mt-0.5">{goal.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-white/80 tabular-nums pr-2">
                      {formatEuro(goal.monthlyAmount)}
                    </span>
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-3.5 h-3.5" aria-hidden="true">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
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
    </main>
  );
}
