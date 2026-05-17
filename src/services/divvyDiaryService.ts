/**
 * DivvyDiary Import Service
 *
 * Sicherheitshinweis: Der API-Key wird ausschließlich als flüchtiger
 * Funktionsparameter übergeben und landet nie in localStorage, SessionStorage,
 * Cookies, Logs oder dem JS-Bundle. Er existiert nur für die Dauer dieses
 * einzelnen Fetch-Aufrufs im Arbeitsspeicher.
 *
 * TODO: Endpunkte und Feldnamen anhand der offiziellen DivvyDiary API-Dokumentation
 *       (https://divvydiary.com/en/blog/api) überprüfen und ggf. anpassen.
 */

import type { Portfolio } from '../types';

// Korrekte API-Subdomain – nicht zu verwechseln mit divvydiary.com (Website)
const DIVVY_DIARY_BASE = 'https://api.divvydiary.com';

// ---------------------------------------------------------------------------
// DivvyDiary API response shapes
// TODO: Gegen aktuelle DivvyDiary API-Docs abgleichen; Feldnamen können
//       von der tatsächlichen Antwort abweichen.
// ---------------------------------------------------------------------------

export interface DivvyDiaryPortfolioResponse {
  /** Gesamter Portfoliowert in der Kontowährung */
  portfolio_value?: number;
  /** Jährliche Dividenden in der Kontowährung */
  annual_dividend?: number;
  /** Dividendenrendite in Prozent (z. B. 4.05 für 4,05 %) */
  dividend_yield?: number;
  // Weitere Felder können nach API-Dokumentation ergänzt werden
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export type DivvyDiaryImportErrorCode =
  | 'INVALID_KEY'
  | 'CORS_BLOCKED'
  | 'NETWORK_ERROR'
  | 'EMPTY_RESPONSE'
  | 'MAPPING_ERROR';

export interface DivvyDiaryImportSuccess {
  success: true;
  /** Nur die Felder, die DivvyDiary geliefert hat – partielle Aktualisierung */
  portfolio: Partial<Portfolio>;
}

export interface DivvyDiaryImportFailure {
  success: false;
  error: DivvyDiaryImportErrorCode;
  /** Nutzersichtbare Fehlermeldung – enthält niemals den API-Key */
  message: string;
}

export type DivvyDiaryImportResult = DivvyDiaryImportSuccess | DivvyDiaryImportFailure;

// ---------------------------------------------------------------------------
// Main import function
// ---------------------------------------------------------------------------

/**
 * Ruft die DivvyDiary API mit dem angegebenen Key ab und gibt die
 * gemappten Portfolio-Felder zurück.
 *
 * @param apiKey - Vom Nutzer eingegebener API-Key; wird NICHT gespeichert.
 */
export async function importFromDivvyDiary(
  apiKey: string,
): Promise<DivvyDiaryImportResult> {
  const trimmedKey = apiKey.trim();

  if (!trimmedKey) {
    return {
      success: false,
      error: 'INVALID_KEY',
      message: 'Bitte einen API-Key eingeben.',
    };
  }

  // --- Netzwerkanfrage -------------------------------------------------------
  let response: Response;
  try {
    // Endpunkt: TODO – gegen offizielle DivvyDiary API-Docs (api.divvydiary.com/documentation)
    // verifizieren. Bekannt ist /symbols/{isin}; ein Portfolio-Endpunkt könnte
    // /portfolio, /user/portfolio o. ä. heißen.
    response = await fetch(`${DIVVY_DIARY_BASE}/portfolio`, {
      method: 'GET',
      headers: {
        // Auth-Format per API-Doku: Bearer – API-Key nur hier verwendet, nicht gespeichert
        Authorization: `Bearer ${trimmedKey}`,
        Accept: 'application/json',
      },
    });
  } catch (err) {
    // fetch() wirft einen TypeError wenn:
    //   1. Der Browser die Anfrage wegen fehlender CORS-Header blockiert
    //      ("Failed to fetch", "NetworkError when attempting to fetch resource", "Load failed")
    //   2. Kein Netzwerk vorhanden ist
    // In beiden Fällen enthält die Meldung keinen API-Key.
    const isTypeError = err instanceof TypeError;
    return {
      success: false,
      // CORS_BLOCKED wird als eigenständiger Fehlertyp zurückgegeben,
      // damit die UI eine hilfreiche Anleitung statt nur einen Fehlertext zeigen kann.
      error: isTypeError ? 'CORS_BLOCKED' : 'NETWORK_ERROR',
      message: isTypeError
        ? 'CORS_BLOCKED'
        : 'Netzwerkfehler – bitte Internetverbindung prüfen.',
    };
  }

  // --- HTTP-Statuscodes auswerten -------------------------------------------
  if (response.status === 401 || response.status === 403) {
    return {
      success: false,
      error: 'INVALID_KEY',
      message: 'Ungültiger API-Key. Bitte in DivvyDiary unter Einstellungen → API prüfen.',
    };
  }

  if (response.status === 404) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      // TODO: Endpunkt prüfen – 404 deutet auf falschen Pfad hin
      message: 'API-Endpunkt nicht gefunden (404). Bitte Service-Konfiguration prüfen.',
    };
  }

  if (!response.ok) {
    return {
      success: false,
      error: 'NETWORK_ERROR',
      message: `DivvyDiary API antwortet mit Fehler ${response.status}.`,
    };
  }

  // --- Antwort parsen -------------------------------------------------------
  let data: DivvyDiaryPortfolioResponse;
  try {
    data = (await response.json()) as DivvyDiaryPortfolioResponse;
  } catch {
    return {
      success: false,
      error: 'EMPTY_RESPONSE',
      message: 'DivvyDiary hat eine leere oder ungültige Antwort gesendet.',
    };
  }

  if (!data || typeof data !== 'object') {
    return {
      success: false,
      error: 'EMPTY_RESPONSE',
      message: 'Keine verwertbaren Daten von DivvyDiary erhalten.',
    };
  }

  // --- Mapping auf internes Portfolio-Modell --------------------------------
  try {
    const portfolio = mapToPortfolio(data);
    if (Object.keys(portfolio).length === 0) {
      return {
        success: false,
        error: 'MAPPING_ERROR',
        // TODO: Feldnamen in mapToPortfolio() an tatsächliche API-Antwort anpassen
        message:
          'Keine bekannten Portfolio-Felder in der Antwort gefunden. ' +
          'Bitte die Feldnamen im Service prüfen (TODO).',
      };
    }
    return { success: true, portfolio };
  } catch {
    return {
      success: false,
      error: 'MAPPING_ERROR',
      message: 'Portfolio-Daten konnten nicht verarbeitet werden.',
    };
  }
}

// ---------------------------------------------------------------------------
// Mapping helper
// ---------------------------------------------------------------------------

/**
 * Konvertiert eine DivvyDiary API-Antwort in ein partielles Portfolio-Objekt.
 * Nur Felder mit validen numerischen Werten werden übernommen.
 *
 * TODO: Feldnamen (portfolio_value, annual_dividend, dividend_yield) gegen
 *       die tatsächliche DivvyDiary API-Antwort verifizieren.
 */
function mapToPortfolio(data: DivvyDiaryPortfolioResponse): Partial<Portfolio> {
  const result: Partial<Portfolio> = {};

  if (isFinitePositive(data.portfolio_value)) {
    result.value = data.portfolio_value!;
  }

  if (isFinitePositive(data.annual_dividend)) {
    // Monatliche Dividenden = Jahres-Dividenden / 12
    result.monthlyIncome = data.annual_dividend! / 12;
  }

  if (isFinitePositive(data.dividend_yield)) {
    // DivvyDiary liefert die Rendite bereits in Prozent (z. B. 4.05)
    result.dividendYield = data.dividend_yield!;
  }

  return result;
}

function isFinitePositive(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v) && v >= 0;
}
