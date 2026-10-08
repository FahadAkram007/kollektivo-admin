import { describe, expect, it } from 'vitest';

import { changePercent } from './dashboard-api';

describe('changePercent', () => {
  it('compares with last month', () => {
    expect(changePercent(150, 100)).toBe(50);
    expect(changePercent(80, 100)).toBe(-20);
    expect(changePercent(100, 0)).toBeNull();
  });
});
