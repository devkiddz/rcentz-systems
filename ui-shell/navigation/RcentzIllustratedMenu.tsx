import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

type MenuItem = { label: string; href: string; group?: string };
type MenuKind = 'resources' | 'solutions' | 'products';

function MenuIllustration({ kind }: { kind: MenuKind }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 260 180"
      className="w-full text-theme-accent"
    >
      <ellipse
        cx="130"
        cy="158"
        rx="92"
        ry="10"
        fill="currentColor"
        opacity="0.06"
      />
      {kind === 'resources' ? (
        <>
          <rect
            x="52"
            y="28"
            width="156"
            height="118"
            rx="12"
            fill="var(--background)"
            stroke="var(--border-strong)"
          />
          <rect
            x="66"
            y="44"
            width="34"
            height="86"
            rx="5"
            fill="var(--surface-muted)"
          />
          {[56, 72, 88, 104].map((y) => (
            <path
              key={y}
              d={`M74 ${y} H91`}
              stroke="var(--muted-foreground)"
              opacity="0.4"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          <rect
            x="112"
            y="44"
            width="80"
            height="26"
            rx="5"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M122 57 H177 M114 84 H183 M114 94 H174 M114 104 H181"
            stroke="var(--muted-foreground)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
          />
          <rect
            x="153"
            y="113"
            width="39"
            height="15"
            rx="4"
            fill="currentColor"
            opacity="0.65"
          />
          <rect
            x="29"
            y="102"
            width="47"
            height="43"
            rx="8"
            fill="var(--background)"
            stroke="var(--border-strong)"
          />
          <path
            d="M41 116 H65 M41 124 H60 M41 132 H55"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle
            cx="208"
            cy="34"
            r="14"
            fill="var(--background)"
            stroke="var(--border-strong)"
          />
          <path
            d="M202 34 L206 38 L214 30"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M62 82 H101 M159 82 H198 M130 107 V132"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 5"
            opacity="0.5"
          />
          <rect
            x="23"
            y="58"
            width="56"
            height="48"
            rx="9"
            fill="var(--background)"
            stroke="var(--border-strong)"
          />
          <rect
            x="99"
            y="43"
            width="62"
            height="65"
            rx="10"
            fill="var(--background)"
            stroke="var(--border-strong)"
          />
          <rect
            x="182"
            y="58"
            width="56"
            height="48"
            rx="9"
            fill="var(--background)"
            stroke="var(--border-strong)"
          />
          <rect
            x="95"
            y="132"
            width="70"
            height="22"
            rx="7"
            fill="currentColor"
            opacity="0.15"
          />
          <path
            d="M35 70 H67 M35 78 H56 M35 92 H66 M194 72 H225 M194 82 H218 M194 92 H222"
            stroke="var(--muted-foreground)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.45"
          />
          <rect
            x="112"
            y="55"
            width="36"
            height="25"
            rx="5"
            fill="currentColor"
            opacity="0.14"
          />
          <path
            d="M119 68 L127 74 L140 60 M114 92 H146"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="81" cy="82" r="3" fill="currentColor" />
          <circle cx="179" cy="82" r="3" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

const intros = {
  resources: {
    label: 'The Rcentz library',
    title: 'Learn. Build. Explore.',
    detail:
      'Find guidance, follow updates and explore the tools behind your next project.'
  },
  solutions: {
    label: 'Built around your business',
    title: 'Connect the way you work.',
    detail:
      'Explore applications, our delivery process and the technology that brings everything together.'
  },
  products: {
    label: 'The Rcentz ecosystem',
    title: 'Tools for everyday work.',
    detail: 'Explore our products and the workflows they support.'
  }
};

export function RcentzIllustratedMenu({
  kind,
  items,
  compact = false,
  onNavigate
}: {
  kind: MenuKind;
  items: readonly MenuItem[];
  compact?: boolean;
  onNavigate: () => void;
}) {
  const intro = intros[kind];
  const groups = Array.from(
    new Set(items.map((item) => item.group ?? 'Explore'))
  );
  return (
    <div
      className={
        compact
          ? 'p-2'
          : 'grid gap-4 p-4 sm:grid-cols-[0.8fr_1.5fr] sm:gap-6 sm:p-5'
      }
    >
      <div
        className={
          compact
            ? 'mb-2 rounded-lg bg-surface-subtle px-3 py-2'
            : 'self-start rounded-xl border border-border bg-surface-subtle p-4'
        }
      >
        <div className={compact ? 'hidden' : 'mx-auto max-w-[260px]'}>
          <MenuIllustration kind={kind} />
        </div>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {intro.label}
        </p>
        <p
          className={
            compact
              ? 'mt-1 text-xs font-semibold'
              : 'mt-2 text-lg font-semibold leading-snug tracking-tight'
          }
        >
          {intro.title}
        </p>
        {!compact ? (
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {intro.detail}
          </p>
        ) : null}
      </div>
      <div className="min-w-0 space-y-4">
        {groups.map((group) => (
          <div key={group}>
            {kind === 'resources' ? (
              <p className="mb-1 px-3 text-[11px] font-medium text-muted-foreground">
                {group}
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-1">
              {items
                .filter((item) => (item.group ?? 'Explore') === group)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className="flex min-h-11 items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {item.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3 shrink-0 text-muted-foreground"
                    />
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
