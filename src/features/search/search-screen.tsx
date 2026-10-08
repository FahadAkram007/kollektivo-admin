'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { PaymentResult } from './payment-result';
import { PersonResult } from './person-result';
import { isEmail } from './search-api';

/** One field for both: a payment reference (from a shop or a ticket) or a person's email address. */
export function SearchScreen() {
  const router = useRouter();
  const pathname = usePathname();
  // The query lives in the address (/suche?q=…), so links from tickets and payments open the right result.
  const query = useSearchParams().get('q')?.trim() ?? '';
  const [input, setInput] = useState(query);

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 md:px-8">
      <form
        className="flex max-w-xl gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          router.push(`${pathname}?q=${encodeURIComponent(input.trim())}`);
        }}
      >
        <input
          type="search"
          autoFocus
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Zahlungsreferenz (z. B. DA7-5330) oder E-Mail-Adresse"
          aria-label="Suche"
          className="min-h-12 flex-1 rounded-xl border border-line px-4 outline-none focus:border-brand-purple"
        />
        <Button type="submit" disabled={!input.trim()}>
          Suchen
        </Button>
      </form>
      {query &&
        (isEmail(query) ? <PersonResult key={query} email={query} /> : <PaymentResult key={query} reference={query} />)}
    </div>
  );
}
