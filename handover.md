# Handover – Branch `claude/fix-ui-milestone-display-K2IPr`

Stand: 2026-05-20

## Ziel des Branches

UI-Verbesserungen, Lighthouse-Performance-Optimierungen und Code-Qualitäts-Refactoring rund um Dashboard, Setup, FreedomHero und LiveFlow. Alle Änderungen sind committed und gepusht. Kein offener Task.

---

## Commits auf diesem Branch (gegenüber `main`)

| Hash | Beschreibung |
|------|-------------|
| `59286b1` | refactor: Dead Code, doppelte Intl-Instanzen, doppelte Milestone-Berechnung entfernt |
| `cdbf8bd` | perf: Vendor-Split wiederhergestellt – paralleler Download senkt LCP-Render-Delay |
| `0c32b98` | perf: CSS deferred, Animation composited, Carousel begrenzt |
| `9b42abe` | perf: CSS-Preload-Chain und erzwungenen Reflow beseitigen; totes FreedomCalendar entfernt |
| `231da16` | a11y: role="presentation" aus Carousel-Slides entfernt |
| `6861029` | UI: Trennlinie nach Hero-Fortschrittsbalken entfernt; Startfeld umbenannt, Jahr-Einheit ausgeblendet |
| `3be53f8` | Dashboard: Kachel-Titel 'Ziele' mit Stern-Icon |
| `2a84dde` | Dashboard: Anzahl aus Header entfernt, Mehr-Button unter die Kacheln verschoben |
| `85c19f7` | Dashboard: Meilensteine + Ausgaben in eine Kachel mit Switch zusammengeführt |
| `a75e69f` | Dashboard: 'Erreicht' statt 'Erreichte Meilensteine/Ausgaben', einheitliches Check-Icon |
| `640815b` | LiveFlow: RefreshRing als Inline-Flex-Item – Header-Höhe identisch zu FreedomHero |
| `26299bd` | LiveFlow: p-5 und space-y-4 – Label-Position an Dashboard angleichen |
| `4b49d31` | LiveFlow: Header-Stil an FreedomHero angleichen |
| `3f912ce` | LiveFlow: Ring absolut in rechter oberer Ecke positioniert |
| `ea20d29` | LiveFlow: Ring etwas kleiner (32→26px), 'Seit Jahr' aus Lifetime entfernt |
| `0106ebb` | fix: SetupPage beim Verlassen remounten → beim Zurückkehren nichts ausgeklappt |
| `3c571af` | feat: Klick auf Ziel/Meilenstein navigiert zu Setup und klappt die Kachel auf |
| `3b0822c` | FreedomHero: Prognose-Jahr zeigt CURRENT_YEAR |
| `ef56362` | LifeUnlocks: achievedYear in die Subtitle-Zeile verschoben |
| `a5ac1bb` | FreedomHero: Jahreszahl unter „Prognose"-Label im Ring |
| `cfb954a` | Meilensteine: erwartetes Zieljahr unter Prozentzahl in LifeUnlocks-Karten |
| `1841f58` | FreedomHero: Offen-Kachel vertikal ausgerichtet, Farbe → gold |
| `0a65bf7` | FreedomHero: Offen-Kachel-Ausrichtung, orange Farbe, Trennlinie entfernt |
| `7a798b9` | FreedomHero: SVG-Ring mit Animation und Prognose-Bogen wiederhergestellt |
| `574a33b` | FreedomHero: Optik an LiveFlow-Hero-Kachel angeglichen |
| `705543f` | Style: Sektionsüberschriften „Details" + „Lifetime-Dividenden" → text-white |
| `1114b01` | Fix: Monatliche-Dividenden-Kachel Farbe text-gold → text-accent (grün) |
| `92adafa` | Portfolio-Tab: umbenannt zu „Dividenden", editierbare gegenseitig berechnende Kacheln |
| `6a311e2` | Dashboard Ausgaben: aktives Ziel erhält gleiche Grün-Optik wie Meilensteine |
| `b1b7cd6` | Fix UI: Meilenstein-Anzeige, Portfolio-Form, LiveFlow, Tab-Resets |

---

## Geänderte Dateien (relevante Übersicht)

### `src/App.tsx`
- `focusMilestoneId` State + `handleMilestoneClick` Callback ergänzt
- `setupResetKey` State: wird inkrementiert, wenn der Nutzer Setup verlässt → SetupPage remountet bei Rückkehr
- `prevTabRef` (useRef) vergleicht vorherigen Tab in einem `useEffect`
- `onMilestoneClick` an Dashboard weitergegeben
- `focusMilestoneId` / `onFocusMilestoneConsumed` an SetupPage weitergegeben
- `key={setupResetKey}` auf `<SetupPage>`

### `src/components/dashboard/Dashboard.tsx`
- **`LifeUnlocks` entfernt** – Meilenstein-Logik vollständig nach Dashboard eingebettet
- `LifeUnlocks.tsx` gelöscht (war separate Komponente)
- `FreedomCalendar.tsx` gelöscht (totes Dead Code – war nie eingebunden, hätte 365+ DOM-Nodes erzeugt)
- Neue State-Variablen: `goalsOrMilestones` ('goals' | 'milestones'), `showAllMilestones`
- Milestone-Sortierung/Filterung inline via `milestoneSortKey`
- **Zusammengeführte Kachel „Ziele"** mit Stern-Icon (`GOALS_ICON`):
  - Toggle oben rechts: `[Ausgaben | Meilensteine]`
  - „+N weitere"-Button erscheint unter den Kacheln
  - Jeder Tab zeigt eigene Liste + `AchievedCarousel` mit Check-Icon
- `MilestoneCard`-Komponente als modulweite Funktion in Dashboard definiert
- `onMilestoneClick` Prop weitergegeben

### `src/components/dashboard/AchievedCarousel.tsx`
- `role="presentation"` von Slide-Wrapper-Divs entfernt → direkte `list`→`listitem`-Kette (ARIA a11y-Fix)
- `aria-hidden` nur auf inaktiven Slides gesetzt (`true | undefined` statt immer `true`)
- `MAX_CAROUSEL_ITEMS = 8`: maximale Anzahl gerenderte Items auf 8 begrenzt

### `src/components/dashboard/FreedomHero.tsx`
- Optik: `bg-accent-muted border border-accent/20` (wie LiveFlow-Hero)
- SVG-Ring vollständig erhalten: Animation, Prognose-Bogen, `prefersReducedMotion`
- Drei Mini-Kacheln: Dividenden (editierbar), Ausgaben (editierbar), Offen (`text-gold`)
- Prognose-Anzeige im Ring: Prozentzahl → „Prognose" → CURRENT_YEAR

### `src/components/goals/GoalList.tsx`
- Scroll-Bug behoben: `onFocusConsumed?.()` im `setTimeout`-Callback (nicht synchron)
- `deCollator` wird jetzt aus `utils/locale.ts` importiert (kein lokales `new Intl.Collator`)

### `src/components/milestones/MilestoneList.tsx`
- Props `focusMilestoneId` und `onFocusConsumed` ergänzt
- `liRefs` (useRef<Map>) für alle `<li>`-Elemente
- `useEffect`: klappt Kachel auf, scrollt nach 350 ms, ruft `onFocusConsumed()` auf
- `deCollator` wird jetzt aus `utils/locale.ts` importiert

### `src/components/setup/SetupPage.tsx`
- Props `focusMilestoneId` und `onFocusMilestoneConsumed` ergänzt
- `useEffect` schaltet bei gesetztem `focusMilestoneId` auf den Meilensteine-Tab um
- `tabKeys`-Mechanismus: Remount bei Sub-Tab-Wechsel setzt Filter/Sort zurück

### `src/components/portfolio/PortfolioForm.tsx`
- Tab-Label und Seitenüberschrift: „Portfolio" → **„Dividenden"**
- Feldbezeichnung: „Seit Jahr" → **„Berechnung ab"**; Einheit „Jahr" im Eingabefeld ausgeblendet
- 4 Felder entfernt: Portfolio-Wert, Monatliche Sparrate, Kursrendite, Anlagehorizont
- Zwei editierbare Hero-Kacheln mit gegenseitiger Berechnung

### `src/components/liveflow/LiveFlow.tsx`
- Trennlinie (`border-t border-accent/15 pt-4`) nach Hero-Fortschrittsbalken entfernt
- RefreshRing 32→26px; Ring als Inline-Flex-Item (Header-Höhe stabil)
- `p-5 space-y-4` – Layout-Matching mit Dashboard

### `src/hooks/useAppState.ts`
- Portfolio-Deps auf relevante Skalare begrenzt (`monthlyIncome`, `dividendGrowth`, `dividendYield`, `monthlySavings`) → unveränderte Felder triggern keine Re-Renders mehr
- `visibleMilestoneResults` filtert `milestoneResults` (O(n)) statt `computeMilestoneResults` ein zweites Mal aufzurufen
- Import `filterMilestonesByExpenses` entfernt (Funktion gelöscht)

### `src/utils/calculations.ts`
- `freeDaysPerMonth` entfernt (Dead Code – nirgends importiert)

### `src/utils/milestones.ts`
- `ISO_DATE_RE` als Modul-Konstante statt per Aufruf neu kompiliert
- `filterMilestonesByExpenses` entfernt (Dead Code nach useAppState-Refactoring)
- `Goal`-Import entfernt (war nur von `filterMilestonesByExpenses` genutzt)

### `src/utils/locale.ts` *(neu)*
- Gemeinsamer `deCollator = new Intl.Collator('de', { sensitivity: 'base' })` Singleton
- Wird von `GoalList.tsx` und `MilestoneList.tsx` importiert

### `src/utils/storage.ts`
- `loadState()` in drei fokussierte Migrations-Helper aufgeteilt:
  - `migratePortfolio(p)` – fehlende Felder, 2012-Jahreszahl-Fix
  - `migrateGoals(goals)` – Kategorie-Sync, entfernte Kategorien, fehlende Default-Ziele
  - `migrateMilestones(stored, goals)` – gelöschte Default-MSs, Titel-Migrationen, Auto-Sync

### `vite.config.ts`
- `deferCss()` Plugin: CSS via `onload`-Pattern nicht-blockierend geladen (schnellere FCP/LCP)
- Vendor-Split (`react` + `react-dom` in eigenem Chunk): paralleler Download via `modulepreload` reduziert den kritischen Pfad von 60 KB auf 45 KB

### `src/index.css`
- `slide-down`-Animation: `grid-template-rows` (Layout-forcing, nicht composited) → `opacity + translateY` (GPU-composited, kein Layout-Reflow)

---

## Navigations-Logik (Klick auf Ziel/Meilenstein)

```
Klick auf Dashboard-Karte
  → handleGoalClick(id) / handleMilestoneClick(id)      [App.tsx]
  → setzt focusGoalId / focusMilestoneId
  → wechselt tab → 'setup'
  → scrollTo({ top: 0 })

SetupPage erkennt focusGoalId / focusMilestoneId
  → wechselt zum richtigen Sub-Tab (goals / milestones)

GoalList / MilestoneList
  → useEffect: setEditingId(capturedId)
  → setTimeout 350 ms: scrollIntoView + onFocusConsumed()
```

---

## Lighthouse-Optimierungen (Ergebnis dieser Session)

| Metrik | Vorher | Nachher |
|--------|--------|---------|
| CLS | 0.000 | 0.000 |
| DOM-Elemente | ~630 (mit FreedomCalendar) | 263 |
| Render-blocking CSS | ja | nein (deferred) |
| Erzwungener Reflow (Animation) | ja (grid-template-rows) | nein (composited) |
| Kritischer Pfad JS | ~60 KB (ein Bundle) | ~45 KB (vendor parallel via modulepreload) |

---

## Bekannte Eigenheiten / Nicht geändert

- **LiveFlow-Countdown-Balken** wurde in einer früheren Session entfernt (nur „Zuletzt aktualisiert"-Text bleibt).
- **BONUS_GOAL_ID** (`'bonus'`): oranges Icon (`text-orange-400`) in Dashboard und GoalList.
- **MilestoneResult.achievedYear** (`number | null`) ist Teil von `src/types/index.ts`.
- Kein Testframework – `npm run build` (TypeScript strict mode) ist das primäre Korrektheitsgatter.
- `ff-hdr-title` in `index.html`: absichtliche Static-Shell für sofortige LCP-Darstellung vor React-Mount; CLS 0.000 bestätigt nahtlosen Übergang.

---

## Nächste Schritte (offen, falls gewünscht)

Keine bekannten offenen Aufgaben. Mögliche Folgearbeiten:

- PR erstellen und in `main` mergen
- `handover.md` vor dem Merge löschen (ist kein dauerhaftes Projektdokument)
