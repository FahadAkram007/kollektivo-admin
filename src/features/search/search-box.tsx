'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import { useDebouncedValue } from '@/lib/use-debounced-value';

import { MIN_QUERY_LENGTH, suggestQuery, toSections, type SuggestionOption } from './suggestions';

/**
 * Search field with suggestions while typing (people, payments, tickets, shops, companies).
 * Arrow keys + Enter pick a suggestion; Enter without one searches exactly (reference or email).
 */
export function SearchBox({ initial = '', autoFocus = false }: { initial?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const listId = useId();
  const [text, setText] = useState(initial);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const query = useDebouncedValue(text.trim(), 300);
  const suggestions = useQuery(suggestQuery(query));

  const sections = query.length >= MIN_QUERY_LENGTH && suggestions.data ? toSections(suggestions.data) : [];
  const options = sections.flatMap((section) => section.options);
  const showList = open && text.trim().length >= MIN_QUERY_LENGTH;

  function go(href: string) {
    setOpen(false);
    setActive(-1);
    router.push(href);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((current) => (options.length ? (current + step + options.length) % options.length : -1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const picked = options[active];
      if (picked) go(picked.href);
      else if (text.trim()) go(`/suche?q=${encodeURIComponent(text.trim())}`);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  }

  return (
    <div className="relative">
      <input
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        aria-label="Suchen"
        autoFocus={autoFocus}
        value={text}
        placeholder="Name, E-Mail, Referenz, Ticket …"
        onChange={(event) => {
          setText(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        // Delay so a click on a suggestion still counts.
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        className="min-h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-brand-purple"
      />
      {showList && (
        <div
          id={listId}
          role="listbox"
          className="absolute top-full left-0 z-20 mt-1 max-h-[70vh] w-[min(28rem,90vw)] overflow-y-auto rounded-xl border border-line bg-white py-1 shadow-lg"
        >
          {sections.length === 0 && (
            <p className="px-3 py-2 text-sm text-ink-muted">
              {text.trim() !== query || suggestions.isFetching
                ? 'Suche …'
                : 'Keine Treffer. Enter sucht genau nach Referenz oder E-Mail.'}
            </p>
          )}
          {sections.map((section) => (
            <div key={section.label} role="group" aria-label={section.label}>
              <p className="px-3 pt-2 pb-1 text-xs font-bold tracking-wide text-ink-muted uppercase">{section.label}</p>
              {section.options.map((option) => (
                <Option
                  key={`${option.kind}-${option.id}`}
                  id={`${listId}-${options.indexOf(option)}`}
                  option={option}
                  active={options.indexOf(option) === active}
                  onPick={() => go(option.href)}
                />
              ))}
              {section.more && (
                <p className="px-3 pb-1 text-xs text-ink-muted">Weitere Treffer – bitte genauer suchen.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Option({
  id,
  option,
  active,
  onPick,
}: {
  id: string;
  option: SuggestionOption;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <div
      id={id}
      role="option"
      aria-selected={active}
      // mousedown instead of click: fires before the input loses focus.
      onMouseDown={(event) => {
        event.preventDefault();
        onPick();
      }}
      className={`cursor-pointer px-3 py-1.5 text-sm ${active ? 'bg-surface' : 'hover:bg-surface'}`}
    >
      <p className="font-medium">{option.title}</p>
      {option.detail && <p className="truncate text-xs text-ink-muted">{option.detail}</p>}
    </div>
  );
}
