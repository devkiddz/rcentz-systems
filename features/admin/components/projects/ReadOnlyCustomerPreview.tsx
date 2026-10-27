'use client';

import type { KeyboardEvent, MouseEvent, ReactNode, FormEvent } from 'react';

type Props = { children: ReactNode };

export function ReadOnlyCustomerPreview({ children }: Props) {
  function blockClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('a, button, input, select, textarea, [role="button"]')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function blockKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('a, button, input, select, textarea, [role="button"]')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function blockSubmit(event: FormEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div
      data-customer-preview="read-only"
      onClickCapture={blockClick}
      onKeyDownCapture={blockKeys}
      onSubmitCapture={blockSubmit}
      className="[&_button]:cursor-not-allowed [&_a]:cursor-not-allowed"
    >
      {children}
    </div>
  );
}
