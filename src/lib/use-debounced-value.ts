'use client';

import { useEffect, useState } from 'react';

/** [value], but only after it hasn't changed for [delayMs] (e.g. a pause while typing). */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
