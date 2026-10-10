import { useMemo } from 'react';
import type { Milestone, MilestoneResult } from '../../types';
import { formatEuro, formatProgressStatus } from '../../utils/formatting';
import { formatMilestoneDate, milestoneSortKey } from '../../utils/milestones';
import { useEditableList } from '../../hooks/useEditableList';
import { AddPanel, applyListView, ListHeader, ListRow, ListToolbar } from '../ui/EditableList';
import { MilestoneIcon } from './MilestoneIcon';
import { MilestoneForm } from './MilestoneForm';

const VIEW = {
  achieved: (m: MilestoneResult) => m.status === 'achieved',
  name: (m: MilestoneResult) => m.title,
  amount: milestoneSortKey,
};

function targetLabel(m: MilestoneResult): string {
  if (m.type === 'dividend') return formatEuro(m.dividendTarget ?? 0);
  return m.dateTarget ? formatMilestoneDate(m.dateTarget) : '';
}

interface MilestoneListProps {
  milestoneResults: MilestoneResult[];
  onAdd: (m: Milestone) => void;
  onUpdate: (m: Milestone) => void;
  onDelete: (id: string) => void;
  focusId?: string | null;
  onFocusConsumed?: () => void;
}

export function MilestoneList({ milestoneResults, onAdd, onUpdate, onDelete, focusId, onFocusConsumed }: MilestoneListProps) {
  const list = useEditableList(onDelete, focusId, onFocusConsumed);
  const { filter, sort } = list;
  const rows = useMemo(() => applyListView(milestoneResults, filter, sort, VIEW), [milestoneResults, filter, sort]);
  const achievedCount = useMemo(() => milestoneResults.filter(VIEW.achieved).length, [milestoneResults]);

  return (
    <section className="space-y-3" aria-labelledby="milestones-heading">
      <ListHeader
        id="milestones-heading"
        label="Meilensteine"
        value={`${achievedCount}/${milestoneResults.length}`}
        meta="erreicht"
        addLabel="Meilenstein"
        onAdd={list.startAdding}
      />
      <ListToolbar list={list} filterLabel="Meilensteine filtern" />

      {list.adding && (
        <AddPanel title="Neuer Meilenstein">
          <MilestoneForm onSave={(m) => { onAdd(m); list.close(); }} onCancel={list.close} />
        </AddPanel>
      )}

      {rows.length === 0 && !list.adding && (
        <p className="py-4 text-center text-sm text-white/50">
          {milestoneResults.length === 0 ? 'Noch keine Meilensteine. Lege deinen ersten an.' : 'Keine Meilensteine in dieser Ansicht.'}
        </p>
      )}

      <ul className="space-y-2" aria-label="Meilensteine">
        {rows.map((m) => (
          <ListRow
            key={m.id}
            id={m.id}
            list={list}
            icon={<MilestoneIcon icon={m.icon} />}
            achieved={m.status === 'achieved'}
            title={m.title}
            subtitle={formatProgressStatus({
              achieved: m.status === 'achieved',
              missing: m.missingMonthly,
              full: m.dividendTarget ?? 0,
              year: m.achievedYear,
              showFull: false,
            })}
            value={targetLabel(m)}
          >
            <MilestoneForm
              initial={m}
              onSave={(saved) => { onUpdate(saved); list.close(); }}
              onCancel={list.close}
              onDelete={() => { onDelete(m.id); list.close(); }}
            />
          </ListRow>
        ))}
      </ul>
    </section>
  );
}
