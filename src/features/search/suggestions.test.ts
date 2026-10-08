import { describe, expect, it } from 'vitest';

import { hrefFor, toSections, type Suggestions } from './suggestions';

const empty = { items: [], more: false };

describe('suggestions', () => {
  it('links each kind to the right page', () => {
    expect(hrefFor('people', 'a@b.de')).toBe('/suche?q=a%40b.de');
    expect(hrefFor('payments', 'AWK-4871')).toBe('/suche?q=AWK-4871');
    expect(hrefFor('shops', 'p1')).toBe('/laeden/p1');
    expect(hrefFor('tickets', 't1')).toBe('/support/t1');
  });

  it('keeps only groups with results, people first', () => {
    const suggestions: Suggestions = {
      people: { items: [{ id: 'a@b.de', title: 'Lea', detail: 'a@b.de' }], more: true },
      payments: empty,
      shops: { items: [{ id: 'p1', title: 'Backstube', detail: 'Senftenberg' }], more: false },
      companies: empty,
      tickets: empty,
    };
    const sections = toSections(suggestions);
    expect(sections.map((section) => section.label)).toEqual(['Personen', 'Läden']);
    expect(sections[0]).toMatchObject({ more: true, options: [{ href: '/suche?q=a%40b.de' }] });
  });
});
