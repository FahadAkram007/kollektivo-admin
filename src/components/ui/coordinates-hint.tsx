/** Where to find latitude and longitude for an address. */
export function CoordinatesHint() {
  return (
    <p className="text-xs text-ink-muted">
      Koordinaten: auf{' '}
      <a href="https://www.openstreetmap.org" target="_blank" rel="noreferrer" className="text-brand-purple underline">
        openstreetmap.org
      </a>{' '}
      die Adresse suchen, Rechtsklick auf das Gebäude → „Adresse anzeigen“; die zwei Zahlen oben sind Breite und Länge
      (z. B. 51.52555, 14.00205).
    </p>
  );
}
