import { queryOptions, keepPreviousData } from '@tanstack/react-query';

import { api, unwrap, type Schemas } from '@/lib/api-client';

export type Suggestions = Schemas['SuggestionsDto'];
export type Suggestion = Schemas['SuggestionDto'];
type Kind = keyof Suggestions;

export const MIN_QUERY_LENGTH = 3;

export const suggestQuery = (query: string) =>
  queryOptions({
    queryKey: ['suggest', query.toLowerCase()],
    queryFn: async () => unwrap(await api.GET('/v1/admin/search/suggest', { params: { query: { q: query } } })),
    enabled: query.length >= MIN_QUERY_LENGTH,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

const GROUPS: { kind: Kind; label: string }[] = [
  { kind: 'people', label: 'Personen' },
  { kind: 'payments', label: 'Zahlungen' },
  { kind: 'tickets', label: 'Tickets' },
  { kind: 'shops', label: 'Läden' },
  { kind: 'companies', label: 'Firmen' },
];

export interface SuggestionOption extends Suggestion {
  kind: Kind;
  href: string;
}

export interface SuggestionSection {
  label: string;
  options: SuggestionOption[];
  more: boolean;
}

/** Where a suggestion leads: people and payments to the search page, the rest to their own pages. */
export function hrefFor(kind: Kind, id: string): string {
  switch (kind) {
    case 'people':
    case 'payments':
      return `/suche?q=${encodeURIComponent(id)}`;
    case 'shops':
      return `/laeden/${id}`;
    case 'companies':
      return `/firmen/${id}`;
    case 'tickets':
      return `/support/${id}`;
  }
}

/** Non-empty groups in display order, each option with its link. */
export function toSections(suggestions: Suggestions): SuggestionSection[] {
  return GROUPS.map(({ kind, label }) => ({
    label,
    more: suggestions[kind].more,
    options: suggestions[kind].items.map((item) => ({ ...item, kind, href: hrefFor(kind, item.id) })),
  })).filter((section) => section.options.length > 0);
}
