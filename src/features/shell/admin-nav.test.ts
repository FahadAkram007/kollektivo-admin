import { describe, expect, it } from 'vitest';

import { navFor } from './admin-nav';

describe('navFor', () => {
  it('shows each role only its pages', () => {
    expect(navFor('admin')).toHaveLength(7);
    expect(navFor('support').map((item) => item.href)).toEqual(['/', '/support', '/suche', '/laeden', '/firmen']);
    expect(navFor('finance').map((item) => item.href)).toEqual(['/', '/laeden', '/firmen']);
  });
});
