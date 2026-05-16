import type { Goal, Portfolio } from '../../types';
import { buildProjection, freedomYear, totalMonthlyCosts } from '../../utils/calculations';
import { formatEuro, formatEuroCompact, formatPercent } from '../../utils/formatting';
import { CURRENT_YEAR } from '../../constants/defaultData';

interface ProjectionViewProps {
  portfolio: Portfolio;
  goals: Goal[];
}

export function ProjectionView({ portfolio, goals }: ProjectionViewProps) {
  const projection = buildProjection(portfolio, goals);
  const total = totalMonthlyCosts(goals);
  const freedom = freedomYear(portfolio, goals);

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-white">Projektion</h1>
        <p className="text-sm text-white/40">Dein Weg zur finanziellen Freiheit.</p>
      </div>

      {/* Freedom year banner */}
      {freedom && (
        <div className="bg-gradient-to-r from-accent/10 to-gold/10 border border-accent/20 rounded-2xl p-5">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Finanzielle Freiheit</p>
          <p className="text-3xl font-bold text-accent">{freedom}</p>
          <p className="text-sm text-white/60 mt-1">
            In {freedom - CURRENT_YEAR} Jahren decken deine Dividenden alle {formatEuro(total)} monatlichen Kosten.
          </p>
          <p className="text-xs text-accent/70 mt-2">
            2026 ist dein Ausgangspunkt für finanzielle Freiheit. 🚀
          </p>
        </div>
      )}

      {/* Projection table */}
      <div className="bg-surface-1 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Jahresprojektion">
            <thead>
              <tr className="border-b border-white/10">
                <th scope="col" className="text-left text-xs text-white/40 font-medium px-4 py-3">Jahr</th>
                <th scope="col" className="text-right text-xs text-white/40 font-medium px-3 py-3">Portfolio</th>
                <th scope="col" className="text-right text-xs text-white/40 font-medium px-3 py-3">Div. / Monat</th>
                <th scope="col" className="text-right text-xs text-white/40 font-medium px-3 py-3">Deckung</th>
                <th scope="col" className="text-right text-xs text-white/40 font-medium px-3 py-3">Freie Tage</th>
              </tr>
            </thead>
            <tbody>
              {projection.map((row, i) => {
                const isFreedom = freedom !== null && row.year === freedom;
                return (
                  <tr
                    key={row.year}
                    className={`border-b border-white/5 transition-colors ${
                      isFreedom ? 'bg-accent/10' : i % 2 === 0 ? '' : 'bg-white/2'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {row.year}
                      {isFreedom && <span className="ml-2 text-accent text-xs">🎉</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-white/70 tabular-nums">
                      {formatEuroCompact(row.portfolioValue)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className={row.coveragePercent >= 100 ? 'text-accent font-semibold' : 'text-white/70'}>
                        {formatEuro(row.monthlyDividends)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className={row.coveragePercent >= 100 ? 'text-accent font-semibold' : 'text-gold'}>
                        {formatPercent(row.coveragePercent)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right text-white/50 tabular-nums">
                      {row.freeDaysPerMonth.toFixed(1).replace('.', ',')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Motivational */}
      <div className="text-center py-4">
        <p className="text-white/30 text-sm">
          Dein Portfolio übernimmt Stück für Stück dein Leben. 💹
        </p>
      </div>
    </main>
  );
}
