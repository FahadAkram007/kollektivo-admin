'use client';

import { useSearchParams } from 'next/navigation';

import { PaymentResult } from './payment-result';
import { PersonResult } from './person-result';
import { SearchBox } from './search-box';
import { isEmail } from './search-api';

/** One field for both: a payment reference (from a shop or a ticket) or a person's email address. */
export function SearchScreen() {
  // The query lives in the address (/suche?q=…), so links from tickets and payments open the right result.
  const query = useSearchParams().get('q')?.trim() ?? '';

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 md:px-8">
      <div className="max-w-xl">
        <SearchBox key={query} initial={query} autoFocus />
        <p className="mt-1 text-xs text-ink-muted">
          Ab 3 Zeichen erscheinen Vorschläge. Enter ohne Auswahl sucht genau nach Zahlungsreferenz oder E-Mail.
        </p>
      </div>
      {query &&
        (isEmail(query) ? <PersonResult key={query} email={query} /> : <PaymentResult key={query} reference={query} />)}
    </div>
  );
}
