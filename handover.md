# Handover – Branch `claude/fix-ui-milestone-display-K2IPr`

Stand: 2026-05-20

## Ziel des Branches

UI-Verbesserungen rund um Dashboard, Setup und FreedomHero. Alle Änderungen sind committed und gepusht. Kein offener Task.

---

## Commits auf diesem Branch (gegenüber `main`)

| Hash | Beschreibung |
|------|-------------|
| `0106ebb` | fix: SetupPage beim Verlassen remounten → beim Zurückkehren nichts ausgeklappt |
| `3c571af` | feat: Klick auf Ziel/Meilenstein navigiert zu Setup und klappt die Kachel auf |
| `3b0822c` | FreedomHero: Prognose-Jahr zeigt CURRENT_YEAR (Ende des laufenden Jahres) |
| `ef56362` | LifeUnlocks: achievedYear in die Subtitle-Zeile verschoben, Abstand verringert |
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
- Prop `onMilestoneClick?: (id: string) => void` ergänzt
- Wird an `<LifeUnlocks>` weitergegeben

### `src/components/dashboard/LifeUnlocks.tsx`
- Prop `onMilestoneClick?: (id: string) => void` ergänzt
- `MilestoneCard` ist jetzt ein `<button>` mit `onClick` → Klick navigiert zu Setup/Meilensteine
- `achievedYear` wird in der Subtitle-Zeile (inline neben offenem Betrag) angezeigt

### `src/components/dashboard/FreedomHero.tsx`
- Optik: `bg-accent-muted border border-accent/20` (wie LiveFlow-Hero)
- SVG-Ring vollständig erhalten: Animation (`useEffect` + `requestAnimationFrame`), Prognose-Bogen, `prefersReducedMotion`
- Drei Mini-Kacheln (`bg-white/5 rounded-xl p-3`): Dividenden (editierbar), Ausgaben (editierbar), Offen (`text-gold`)
- Prognose-Anzeige im Ring: Prozentzahl → „Prognose" (y=112) → CURRENT_YEAR (y=128)
- Buttons in Kacheln haben `block`-Klasse (verhindert `inline-block`-Versatz)

### `src/components/goals/GoalList.tsx`
- **Scroll-Bug behoben**: `onFocusConsumed?.()` wird jetzt im `setTimeout`-Callback aufgerufen (nicht mehr synchron), damit der Timer nicht durch die ausgelöste Re-Render abgebrochen wird

### `src/components/milestones/MilestoneList.tsx`
- Props `focusMilestoneId` und `onFocusConsumed` ergänzt
- `liRefs` (useRef<Map>) für alle `<li>`-Elemente
- `useEffect`: klappt die Kachel auf, scrollt nach 350 ms zum Element, ruft dann `onFocusConsumed()` auf

### `src/components/setup/SetupPage.tsx`
- Props `focusMilestoneId` und `onFocusMilestoneConsumed` ergänzt
- `useEffect` schaltet bei gesetztem `focusMilestoneId` auf den Meilensteine-Tab um
- `tabKeys`-Mechanismus: beim Verlassen eines Sub-Tabs wird dessen Key inkrementiert → Remount bei Rückkehr (setzt Filter/Sort zurück)

### `src/components/portfolio/PortfolioForm.tsx`
- Tab-Label und Seitenüberschrift: „Portfolio" → **„Dividenden"**
- 4 Felder entfernt: Portfolio-Wert, Monatliche Sparrate, Kursrendite, Anlagehorizont
- Zwei editierbare Hero-Kacheln mit gegenseitiger Berechnung:
  - Jährliche Dividenden → speichert `monthlyIncome = v / 12`
  - Monatliche Dividenden → speichert `monthlyIncome = v`
- Sektionsüberschriften „Details" und „Lifetime-Dividenden" in `text-white`

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

## Bekannte Eigenheiten / Nicht geändert

- **LiveFlow-Countdown-Balken** wurde in einer früheren Session entfernt (nur „Zuletzt aktualisiert"-Text bleibt).
- **BONUS_GOAL_ID** (`'bonus'`): oranges Icon (`text-orange-400`) wird konsequent in Dashboard und GoalList angewendet.
- **MilestoneResult.achievedYear** (`number | null`) ist Teil von `src/types/index.ts` und wird in `computeMilestoneResult` / `milestoneAchievedYear` berechnet.
- Die `filterMilestonesByExpenses`-Funktion blendet Dividenden-Meilensteine aus, deren Ziel die Gesamtausgaben übersteigt (wirkt auf Timeline und Setup-Ansicht).
- Kein Testframework vorhanden – `npm run build` (TypeScript strict mode) ist das primäre Korrektheitsgatter.

---

## Nächste Schritte (offen, falls gewünscht)

Keine bekannten offenen Aufgaben. Mögliche Folgearbeiten:

- PR erstellen und in `main` mergen
- `handover.md` vor dem Merge löschen (ist kein dauerhaftes Projektdokument)
