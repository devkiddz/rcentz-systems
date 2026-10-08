'use client';

import { useHydratedReducedMotion } from '@/hooks/use-hydrated-reduced-motion';

import { rcentzTypography } from '@/ui-shell/brand/rcentz-typography';
import { InlineToolCode } from './InlineToolCode';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { Check, GitBranch, Layers3 } from 'lucide-react';

const explanations = [
  {
    title: 'Interfaces people can use.',
    description:
      'Next.js, React and TypeScript help us build clear applications for your customers and team.'
  },
  {
    title: 'Information that stays connected.',
    description:
      'APIs, Prisma and PostgreSQL bring application workflows and structured business records together.'
  },
  {
    title: 'A clear path to delivery.',
    description:
      'GitHub keeps changes versioned. Vercel provides deployment previews and a path to production.'
  }
] as const;

const stages = [
  {
    title: 'Verify who is signing in',
    detail:
      'Authentication establishes the identity behind each account and session.'
  },
  {
    title: 'Check what they can do',
    detail:
      'Server-side permissions control access to records, actions and administrative tools.'
  },
  {
    title: 'Keep company access separate',
    detail:
      'Company ownership checks keep requests and records within the correct business account.'
  },
  {
    title: 'Validate every request',
    detail:
      'Input checks and business rules reject invalid changes before they reach stored records.'
  },
  {
    title: 'Review changes before release',
    detail:
      'Access checks and key workflows are tested in a preview before deployment.'
  }
] as const;

function ArchitectureDiagram({ active }: { active: boolean }) {
  const nodes = [
    {
      x: 16,
      title: 'Next.js',
      tools: 'React / TypeScript',
      label: 'Session check',
      kind: 'ui',
      code: [
        '// Server guard',
        'await',
        '  requireAuth();'
      ].join('\n')
    },
    {
      x: 186,
      title: 'API / Prisma',
      tools: 'Application logic',
      label: 'Profile query',
      kind: 'logic',
      code: [
        'await prisma',
        '  .user',
        '  .findUnique({',
        '    where: {',
        '      id:',
        '        user.id',
        '    }',
        '  });'
      ].join('\n')
    },
    {
      x: 356,
      title: 'Database',
      tools: 'PostgreSQL',
      label: 'SQL example',
      kind: 'data',
      code: [
        "SELECT id, name",
        "FROM \"user\"",
        "WHERE id = $1;"
      ].join('\n')
    }
  ];

  const canvasRef = useRef<HTMLDivElement>(null);
  const codeRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [bottoms, setBottoms] = useState([355, 355, 355]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const measure = () => {
      const width = canvas.getBoundingClientRect().width;
      if (!width) return;

      const next = codeRefs.current.map(element =>
        355 + ((element?.getBoundingClientRect().height ?? 0) * 500) / width
      );

      setBottoms(previous =>
        next.every((value, index) => Math.abs(value - previous[index]) < 0.5)
          ? previous
          : next
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(canvas);

    for (const element of codeRefs.current) {
      if (element) observer.observe(element);
    }

    measure();
    return () => observer.disconnect();
  }, []);

  const footerY = Math.max(738, Math.max(...bottoms) + 120);
  const mergeY = footerY - 80;
  const canvasHeight = footerY + 92;

  const paths = [
    'M250 78 V142 Q250 158 234 158 H96 Q80 158 80 174 V240',
    'M250 78 V240',
    'M250 78 V142 Q250 158 266 158 H404 Q420 158 420 174 V240',
    'M80 328 V355',
    'M250 328 V355',
    'M420 328 V355',
    'M80 ' + bottoms[0] + ' V' + (mergeY - 16) +
      ' Q80 ' + mergeY + ' 96 ' + mergeY +
      ' H234 Q250 ' + mergeY + ' 250 ' + (mergeY + 16) +
      ' V' + footerY,
    'M250 ' + bottoms[1] + ' V' + footerY,
    'M420 ' + bottoms[2] + ' V' + (mergeY - 16) +
      ' Q420 ' + mergeY + ' 404 ' + mergeY +
      ' H266 Q250 ' + mergeY + ' 250 ' + (mergeY + 16) +
      ' V' + footerY
  ];

  return (
    <div
      ref={canvasRef}
      className="relative min-w-0 w-full max-w-md mx-auto lg:max-w-none"
      style={{
        aspectRatio: '500 / ' + canvasHeight,
        containerType: 'inline-size'
      }}>
      <svg
        aria-hidden="true"
        viewBox={'0 0 500 ' + canvasHeight}
        className="absolute inset-0 h-full w-full">
        <g fill="none" stroke="var(--border)" strokeWidth="0.6" opacity="0.35">
          {Array.from({ length: 13 }, (_, index) => (
            <line key={index} x1={10 + index * 40} x2={10 + index * 40} y1="0" y2={canvasHeight} />
          ))}
        </g>

        <g
          fill="none"
          stroke="var(--border)"
          strokeWidth="0.8"
          opacity="0.6">
          <path d="M22 210 H46 V228" />
          <path d="M478 210 H454 V228" />
          <path d="M122 690 V770 H82 V804" />
          <path d="M378 690 V770 H418 V804" />
        </g>

        {paths.map((connection, index) => (
          <g key={connection}>
            <path
              d={connection}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="1"
            />
            {active ? (
              <motion.path
                d={connection}
                pathLength={100}
                fill="none"
                stroke="var(--theme-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="3 100"
                opacity="0.6"
                initial={{ strokeDashoffset: 105 }}
                animate={{ strokeDashoffset: -105 }}
                transition={{
                  duration: 8,
                  delay: (index % 3) * 1.6,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            ) : null}
          </g>
        ))}

        <rect
          x="172" y="30" width="156" height="48" rx="12"
          fill="var(--foreground)"
        />
        <text
          x="250" y="59"
          textAnchor="middle"
          fill="var(--background)"
          fontSize="12"
          fontWeight="600">
          Your application
        </text>

        {[192, 214, 236, 258, 280, 302].map(x => (
          <g key={x} fill="var(--border-strong)">
            <rect x={x} y="24" width="7" height="6" rx="1" />
            <rect x={x} y="78" width="7" height="6" rx="1" />
          </g>
        ))}

        <path
          d="M90 54 H172"
          fill="none"
          stroke="var(--border-strong)"
          strokeDasharray="3 4"
        />
        <circle
          cx="68" cy="54" r="22"
          fill="var(--surface-raised)"
          stroke="var(--border-strong)"
        />
        <g fill="none" stroke="var(--theme-accent)" strokeWidth="1.2">
          <circle cx="68" cy="49" r="5" />
          <path d="M58 65 C58 55 78 55 78 65" />
        </g>
        <text
          x="68" y="95"
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize="9">
          Authenticated user
        </text>

        {[80, 250, 420].map(x => (
          <g key={x}>
            <circle
              cx={x} cy="205" r="3"
              fill="var(--background)"
              stroke="var(--theme-accent)"
              strokeOpacity="0.7"
            />
            <circle
              cx={x} cy="610" r="3"
              fill="var(--background)"
              stroke="var(--border-strong)"
            />
          </g>
        ))}

        {nodes.map(node => (
          <g key={node.title}>
            <rect
              x={node.x} y="240" width="128" height="88" rx="12"
              fill="var(--surface-raised)"
              stroke="var(--border-strong)"
            />
            {[252, 270, 288, 306].map(y => (
              <g key={y} fill="var(--border-strong)">
                <rect x={node.x - 4} y={y} width="4" height="5" rx="1" />
                <rect x={node.x + 128} y={y} width="4" height="5" rx="1" />
              </g>
            ))}

            <g
              transform={'translate(' + (node.x + 48) + ' 251)'}
              stroke="var(--theme-accent)"
              strokeWidth="1"
              fill="none">
              {node.kind === 'ui' ? (
                <>
                  <rect width="32" height="19" rx="3" />
                  <path d="M0 5 H32 M5 9 H15 M5 13 H12" />
                  <rect x="20" y="9" width="7" height="6" rx="1" />
                </>
              ) : node.kind === 'logic' ? (
                <>
                  <rect x="7" y="2" width="18" height="15" rx="3" />
                  <path d="M0 7 H7 M0 12 H7 M25 7 H32 M25 12 H32 M13 0 V2 M19 0 V2 M13 17 V20 M19 17 V20" />
                  <path d="M13 7 L10 10 L13 13 M19 7 L22 10 L19 13" />
                </>
              ) : (
                <>
                  <ellipse cx="16" cy="4" rx="12" ry="4" />
                  <path d="M4 4 V15 C4 20 28 20 28 15 V4" />
                  <path d="M4 10 C4 15 28 15 28 10" />
                </>
              )}
            </g>

            <text
              x={node.x + 64} y="292"
              textAnchor="middle"
              fill="var(--foreground)"
              fontSize="12"
              fontWeight="500">
              {node.title}
            </text>
            <text
              x={node.x + 64} y="311"
              textAnchor="middle"
              fill="var(--muted-foreground)"
              fontSize="10">
              {node.tools}
            </text>
          </g>
        ))}



        <circle
          cx="250" cy={mergeY} r="4"
          fill="var(--background)"
          stroke="var(--theme-accent)"
          strokeOpacity="0.7"
        />

        <rect
          x="155" y={footerY} width="190" height="56" rx="12"
          fill="var(--surface-raised)"
          stroke="var(--border-strong)"
        />
        <text
          x="250" y={footerY + 24}
          textAnchor="middle"
          fill="var(--foreground)"
          fontSize="12"
          fontWeight="500">
          Version and deploy
        </text>
        <text
          x="250" y={footerY + 42}
          textAnchor="middle"
          fill="var(--muted-foreground)"
          fontSize="10">
          GitHub / Vercel
        </text>
      </svg>

      {nodes.map((node, index) => (
        <div
          key={node.title + '-code'}
          ref={element => {
            codeRefs.current[index] = element;
          }}
          className="absolute z-10"
          style={{
            left: (node.x / 500) * 100 + '%',
            top: (355 / canvasHeight) * 100 + '%',
            width: '25.6%'
          }}>
          <InlineToolCode
            label={node.label}
            code={node.code}
            active={active}
            delay={index * 1200}
          />
        </div>
      ))}

      <div className="sr-only">
        <p>
          An authenticated user accesses the application. Next.js checks the
          session, Prisma reads the user profile, and PostgreSQL handles
          a parameterised query. These are illustrative code fragments.
        </p>
        {nodes.map(node => (
          <div key={node.title}>
            <p>{node.title}: {node.label}</p>
            <pre><code>{node.code}</code></pre>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SystemsToolsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.2 });
  const reducedMotion = Boolean(useHydratedReducedMotion());

  return (
    <section
      id="tools"
      aria-labelledby="systems-tools-title"
      className="rcentz-section border-b border-border py-12 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.7fr] lg:gap-12">
        <div className="lg:pt-3">
          <p className="inline-flex h-fit w-fit self-start items-center gap-2 rounded-full border border-border bg-surface-subtle px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-theme-accent" />
            Our tools
          </p>
        </div>
        <div className="min-w-0">
          <h2
            id="systems-tools-title"
            className={rcentzTypography.className + ' font-extrabold tracking-normal text-3xl sm:text-4xl lg:text-[2.5rem] leading-[1.18]'}>
            <span className="block font-semibold text-muted-foreground lg:pl-12">
              Proven technology.
            </span>
            <span className="mt-2 block font-extrabold text-foreground">
              Built around your business.
            </span>
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 sm:text-base sm:leading-7 text-muted-foreground">
            We choose the right tools to build your applications, connect
            your data and support how your company works.
          </p>
        </div>
      </div>

      <div
        ref={ref}
        className="mt-8 grid items-center gap-10 sm:mt-12 lg:grid-cols-[0.85fr_1.4fr_1fr] lg:gap-8">
        <div className="space-y-8">
          {explanations.map(item => (
            <div key={item.title}>
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
          <p className="font-mono text-[10px] text-muted-foreground">
            TypeScript across the application
          </p>
        </div>

        <ArchitectureDiagram active={visible && !reducedMotion} />

        <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface-subtle">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Layers3 aria-hidden="true" className="size-3.5 text-theme-accent" />
            <p className="text-xs font-medium">Protection by design</p>
            <span className="ml-auto text-[9px] text-muted-foreground">
              Approach
            </span>
          </div>

          <ol
            aria-label="Protection steps"
            className="space-y-4 p-4">
            {stages.map((stage, index) => (
              <li
                key={stage.title}
                className={[
                  'flex',
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                ].join(' ')}>
                <div
                  className={[
                    'max-w-[90%] px-3 py-3',
                    index % 2 === 0
                      ? 'rounded-2xl rounded-tl-sm border border-border bg-background'
                      : 'rounded-2xl rounded-tr-sm bg-surface-muted'
                  ].join(' ')}>
                  <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    Step {index + 1}
                  </p>
                  <p className="text-xs font-medium leading-5">
                    {stage.title}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    {stage.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mx-4 mb-4 flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2 text-[10px]">
            <span className="flex items-center gap-1.5">
              <GitBranch aria-hidden="true" className="size-3" />
              Checks before release
            </span>
            <Check aria-hidden="true" className="size-3 text-theme-accent" />
          </div>
        </div>
      </div>
    </section>
  );
}
