'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { RemoteDeliveryGlobe, deliveries } from './RemoteDeliveryGlobe';
import styles from './SystemsRemoteSection.module.css';

export function SystemsRemoteSection() {
  const [active, setActive] = useState(-1);
  const list = useRef<HTMLOListElement>(null);
  const items = useRef<Array<HTMLLIElement | null>>([]);
  const reducedMotion = Boolean(useReducedMotion());

  const highlightDelivery = useCallback((index: number) => {
    setActive(index);
  }, []);

  useEffect(() => {
    if (active < 0) return;
    const container = list.current;
    const item = items.current[active];
    if (!container || !item) return;

    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    container.scrollTo({
      top: desktop
        ? Math.max(0, item.offsetTop - container.clientHeight / 2 + item.offsetHeight / 2)
        : 0,
      left: desktop ? 0 : Math.max(0, item.offsetLeft - 12),
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
  }, [active, reducedMotion]);

  return (
    <section
      id="remote-delivery"
      aria-labelledby="systems-remote-title"
      className={[styles.section, 'relative isolate border-b border-border bg-surface-subtle'].join(' ')}>
      <div className={[styles.layout, 'rcentz-section'].join(' ')}>
        <div className={styles.introduction}>
          <div>
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-theme-accent" />
              Remote delivery
            </p>
            <h2
              id="systems-remote-title"
              className="mt-4 text-3xl leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
              <span className="block font-normal text-muted-foreground">
                Built for your business.
              </span>
              <span className="mt-1 block font-medium text-foreground">
                Delivered across borders.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Work directly with Rcentz to plan, build and launch remotely.
            Follow progress, review working previews and stay involved
            from the first brief to delivery.
          </p>
        </div>

        <div className={styles.stage}>
          <div data-globe-viewport className={styles.globe}>
            <RemoteDeliveryGlobe onActiveChange={highlightDelivery} />
          </div>

          <aside
            aria-labelledby="delivery-monitor-title"
            className={[styles.monitor, 'min-w-0 rounded-2xl border border-border bg-background/80'].join(' ')}>
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <h3 id="delivery-monitor-title" className="text-sm font-semibold">
                Delivery monitor
              </h3>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Examples / USD
                </span>
                <span aria-hidden="true" className="flex items-center gap-1.5">
                  <span className={[styles.readingLight, styles.greenLight].join(' ')} />
                  <span className={[styles.readingLight, styles.blueLight].join(' ')} />
                  <span className={[styles.readingLight, styles.redLight].join(' ')} />
                </span>
              </div>
            </div>

            <ol
              ref={list}
              className={styles.timeline}
              aria-label="Illustrative software deliveries">
              {deliveries.map((delivery, index) => (
                <li
                  key={delivery.city}
                  ref={element => { items.current[index] = element; }}
                  aria-current={active === index ? 'step' : undefined}
                  className={[
                    'relative shrink-0 rounded-lg border px-3 py-2 transition-colors duration-300',
                    active === index
                      ? 'border-theme-accent/40 bg-surface-muted'
                      : 'border-transparent'
                  ].join(' ')}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-xs font-semibold">
                      <span
                        aria-hidden="true"
                        className={[
                          'size-1.5 rounded-full',
                          active === index ? 'bg-theme-accent' : 'bg-border-strong'
                        ].join(' ')}
                      />
                      {delivery.city}
                    </p>
                    <span className="font-mono text-xs font-medium">{delivery.bill}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-5">{delivery.name}</p>
                  <p className="mt-1 text-[10px] text-theme-accent">{delivery.category}</p>
                  <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                    {delivery.scope}
                  </p>
                </li>
              ))}
            </ol>

            <p className="border-t border-border px-4 py-3 text-[10px] leading-4 text-muted-foreground">
              Sample project scopes and bills. Illustrative, not completed-job claims or fixed quotes.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
