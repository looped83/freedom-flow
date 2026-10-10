import { useMemo } from 'react';
import type { Goal, GoalResult } from '../../types';
import { BONUS_GOAL_ID } from '../../constants/defaultData';
import { formatEuro, formatProgressStatus } from '../../utils/formatting';
import { saveGoalDefault } from '../../utils/storage';
import { useEditableList } from '../../hooks/useEditableList';
import { AddPanel, applyListView, ListHeader, ListRow, ListToolbar } from '../ui/EditableList';
import { CategoryIcon } from './CategoryIcon';
import { GoalForm } from './GoalForm';

const VIEW = {
  achieved: (g: GoalResult) => g.status === 'covered',
  name: (g: GoalResult) => g.name,
  amount: (g: GoalResult) => g.monthlyAmount,
};

interface GoalListProps {
  goalResults: GoalResult[];
  total: number;
  onAdd: (g: Goal) => void;
  onUpdate: (g: Goal) => void;
  onDelete: (id: string) => void;
  focusId?: string | null;
  onFocusConsumed?: () => void;
}

export function GoalList({ goalResults, total, onAdd, onUpdate, onDelete, focusId, onFocusConsumed }: GoalListProps) {
  const list = useEditableList(onDelete, focusId, onFocusConsumed);
  const { filter, sort } = list;
  const rows = useMemo(() => applyListView(goalResults, filter, sort, VIEW), [goalResults, filter, sort]);
  const coveredCount = useMemo(() => goalResults.filter(VIEW.achieved).length, [goalResults]);

  return (
    <section className="space-y-3" aria-labelledby="goals-heading">
      <ListHeader
        id="goals-heading"
        label="Ausgaben / Monat"
        value={formatEuro(total)}
        meta={`${coveredCount}/${goalResults.length} erreicht`}
        addLabel="Ausgabe"
        onAdd={list.startAdding}
      />
      <ListToolbar list={list} filterLabel="Ausgaben filtern" />

      {list.adding && (
        <AddPanel title="Neue Ausgabe">
          <GoalForm onSave={(g) => { onAdd(g); list.close(); }} onCancel={list.close} />
        </AddPanel>
      )}

      {rows.length === 0 && !list.adding && (
        <p className="py-4 text-center text-sm text-white/50">Keine Ausgaben in dieser Ansicht.</p>
      )}

      <ul className="space-y-2" aria-label="Ausgaben">
        {rows.map((g) => (
          <ListRow
            key={g.id}
            id={g.id}
            list={list}
            icon={<CategoryIcon category={g.category} className={`w-5 h-5 ${g.id === BONUS_GOAL_ID ? 'text-gold' : ''}`} />}
            achieved={g.status === 'covered'}
            title={g.name}
            subtitle={formatProgressStatus({
              achieved: g.status === 'covered',
              missing: g.monthlyAmount - g.coveredAmount,
              full: g.monthlyAmount,
              year: g.achievedYear,
              showFull: false,
            })}
            value={formatEuro(g.monthlyAmount)}
          >
            <GoalForm
              initial={g}
              onSave={(saved) => { onUpdate(saved); list.close(); }}
              onSaveAsDefault={saveGoalDefault}
              onCancel={list.close}
              onDelete={() => { onDelete(g.id); list.close(); }}
            />
          </ListRow>
        ))}
      </ul>
    </section>
  );
}
