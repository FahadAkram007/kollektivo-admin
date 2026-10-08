import { describe, expect, it } from 'vitest';

import { entityHref } from './audit-labels';

describe('entityHref', () => {
  it('links records to their admin pages', () => {
    expect(entityHref('partner', 'p1', 'Backstube')).toBe('/laeden/p1');
    expect(entityHref('user', 'u1', 'a@b.de')).toBe('/suche?q=a%40b.de');
    expect(entityHref('employee', 'e1', 'a@b.de bei Firma')).toBe('/suche?q=a%40b.de');
    expect(entityHref('partner_location', 'l1', 'Markt 7')).toBeNull();
    expect(entityHref('user', null, null)).toBeNull();
  });
});
