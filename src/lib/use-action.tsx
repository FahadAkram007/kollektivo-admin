'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { ApiError } from './api-client';

type ActionState = { status: 'idle' | 'busy' } | { status: 'done'; text: string } | { status: 'failed'; text: string };

/** Runs a change, reloads [queryKeys] and shows a short result next to the button. */
export function useAction(queryKeys: readonly (readonly unknown[])[]) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<ActionState>({ status: 'idle' });

  async function run(action: () => Promise<unknown>, done = 'Gespeichert.'): Promise<boolean> {
    setState({ status: 'busy' });
    try {
      await action();
      await Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      setState({ status: 'done', text: done });
      return true;
    } catch (error) {
      // Admin users get the API's own message: it says exactly what was wrong.
      setState({ status: 'failed', text: error instanceof ApiError ? error.message : 'Keine Verbindung zur API.' });
      return false;
    }
  }

  return { state, busy: state.status === 'busy', run, reset: () => setState({ status: 'idle' }) };
}

export function ActionFeedback({ state }: { state: ActionState }) {
  if (state.status === 'done') return <p className="text-sm text-success">✓ {state.text}</p>;
  if (state.status === 'failed') {
    return (
      <p role="alert" className="text-sm text-error">
        {state.text}
      </p>
    );
  }
  return null;
}
