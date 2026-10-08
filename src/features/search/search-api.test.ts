import { describe, expect, it } from 'vitest';

import { isEmail } from './search-api';

describe('isEmail', () => {
  it('tells email addresses from payment references', () => {
    expect(isEmail('fahad@herrmann-lausitz.de')).toBe(true);
    expect(isEmail('DA7-5330')).toBe(false);
  });
});
