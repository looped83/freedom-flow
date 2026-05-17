import { useRef, useState } from 'react';
import type { Portfolio } from '../../types';
import { importFromDivvyDiary } from '../../services/divvyDiaryService';

interface DivvyDiaryImportProps {
  currentPortfolio: Portfolio;
  onImport: (p: Portfolio) => void;
}

type ImportStatus = 'idle' | 'loading' | 'success' | 'error' | 'cors_blocked';

const IMPORT_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const INFO_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

// Mapping: welches DivvyDiary-Feld → wo in der App + wo in DivvyDiary zu finden
const CORS_FIELD_GUIDE = [
  {
    divvyDiaryLabel: 'Gesamtwert',
    appLabel: 'Portfolio-Wert',
    hint: 'Dashboard → "Depotübersicht" → Gesamtwert',
  },
  {
    divvyDiaryLabel: 'Dividenden / Monat',
    appLabel: 'Monatliche Dividenden',
    hint: 'Dashboard → "Dividenden" → Monatlich',
  },
  {
    divvyDiaryLabel: 'Dividendenrendite',
    appLabel: 'Dividendenrendite (%)',
    hint: 'Dashboard → "Performance" → Yield on Cost / Rendite',
  },
];

export function DivvyDiaryImport({ currentPortfolio, onImport }: DivvyDiaryImportProps) {
  // Der API-Key lebt ausschließlich in diesem lokalen State.
  // Er wird niemals in localStorage, sessionStorage, Cookies oder Logs geschrieben.
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<ImportStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [importedFields, setImportedFields] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    setImportedFields([]);

    const result = await importFromDivvyDiary(apiKey);

    if (!result.success) {
      if (result.error === 'CORS_BLOCKED') {
        setStatus('cors_blocked');
        // Key nach CORS-Fehler im State behalten, damit der Nutzer
        // nicht erneut tippen muss wenn er es später nochmal versucht.
      } else {
        setStatus('error');
        setErrorMessage(result.message);
        inputRef.current?.focus();
      }
      return;
    }

    onImport({ ...currentPortfolio, ...result.portfolio });
    setImportedFields(
      Object.keys(result.portfolio).map((k) => FIELD_LABELS[k as keyof Portfolio] ?? k),
    );
    setStatus('success');
    setApiKey('');
    setTimeout(() => {
      setStatus('idle');
      setImportedFields([]);
    }, 4000);
  }

  return (
    <section
      className="mt-6 bg-surface-1 rounded-2xl p-5"
      aria-labelledby="divvydiary-import-heading"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-1">
        <span className="text-blue-accent">{IMPORT_ICON}</span>
        <h3 id="divvydiary-import-heading" className="text-sm font-semibold text-white">
          DivvyDiary Import
        </h3>
      </div>
      <p className="text-xs text-white/45 mb-4 leading-relaxed">
        Der API-Key wird nur lokal zur Laufzeit verwendet und nicht gespeichert.
      </p>

      {/* CORS-Erklärung – wird angezeigt wenn der Browser den Aufruf blockiert */}
      {status === 'cors_blocked' && (
        <div
          role="alert"
          className="mb-4 bg-gold/5 border border-gold/25 rounded-xl p-4 space-y-3"
        >
          <div className="flex items-start gap-2 text-gold">
            {INFO_ICON}
            <p className="text-xs font-semibold leading-relaxed">
              Direkter Browser-Zugriff blockiert (CORS)
            </p>
          </div>
          <p className="text-xs text-white/65 leading-relaxed">
            DivvyDiarys API erlaubt keine direkten Anfragen aus dem Browser – das ist
            eine serverseitige Einschränkung der API, kein Problem mit deinem Key.
          </p>
          <p className="text-xs text-white/65 leading-relaxed">
            <span className="text-white/80 font-medium">Workaround:</span> Öffne dein{' '}
            <a
              href="https://divvydiary.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-accent underline underline-offset-2 hover:text-white transition-colors"
            >
              DivvyDiary-Dashboard
            </a>{' '}
            und trage die Werte manuell über die Schieberegler unten ein:
          </p>
          <ul className="space-y-2">
            {CORS_FIELD_GUIDE.map((f) => (
              <li key={f.appLabel} className="flex gap-2 text-xs">
                <span className="text-white/30 flex-shrink-0">→</span>
                <span>
                  <span className="text-white/80 font-medium">{f.appLabel}</span>
                  <span className="text-white/40"> · {f.hint}</span>
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setStatus('idle');
              setErrorMessage('');
            }}
            className="text-xs text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
          >
            Erneut versuchen
          </button>
        </div>
      )}

      <form
        onSubmit={handleImport}
        className="space-y-3"
        aria-label="DivvyDiary-Daten importieren"
      >
        {/* API-Key Eingabe */}
        <div>
          <label
            htmlFor="divvydiary-api-key"
            className="text-xs text-white/65 font-medium block mb-1.5"
          >
            DivvyDiary API-Key
          </label>
          <input
            ref={inputRef}
            id="divvydiary-api-key"
            type="password"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              if (status === 'error' || status === 'cors_blocked') {
                setStatus('idle');
                setErrorMessage('');
              }
            }}
            placeholder="Deinen API-Key eingeben …"
            disabled={status === 'loading'}
            style={{ fontSize: '16px' }}
            className="w-full bg-surface-2 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-accent/60 disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Allgemeiner Fehler */}
        {status === 'error' && (
          <p
            role="alert"
            className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2"
          >
            {errorMessage}
          </p>
        )}

        {/* Erfolgsmeldung */}
        {status === 'success' && (
          <p
            role="status"
            className="text-xs text-accent bg-accent/10 border border-accent/20 rounded-lg px-3 py-2"
          >
            ✓ Importiert: {importedFields.length > 0 ? importedFields.join(', ') : 'Portfolio-Daten'}
          </p>
        )}

        {/* Import-Button – ausgeblendet wenn CORS-Anleitung sichtbar */}
        {status !== 'cors_blocked' && (
          <button
            type="submit"
            disabled={!apiKey.trim() || status === 'loading' || status === 'success'}
            className="w-full flex items-center justify-center gap-2 bg-surface-2 border border-white/10 text-white/80 font-medium py-2.5 rounded-xl hover:bg-surface-3 hover:border-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent text-sm"
          >
            {status === 'loading' ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin flex-shrink-0" />
                Importiere …
              </>
            ) : (
              <>
                {IMPORT_ICON}
                Import starten
              </>
            )}
          </button>
        )}
      </form>
    </section>
  );
}

const FIELD_LABELS: Partial<Record<keyof Portfolio, string>> = {
  value: 'Portfolio-Wert',
  monthlyIncome: 'Monatliche Dividenden',
  dividendYield: 'Dividendenrendite',
  monthlySavings: 'Sparrate',
  dividendGrowth: 'Dividendenwachstum',
  priceReturn: 'Kursrendite',
  horizonYears: 'Anlagehorizont',
};
