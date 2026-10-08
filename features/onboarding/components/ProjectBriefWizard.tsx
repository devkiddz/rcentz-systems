'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe2,
  Layers3,
  ShoppingBag,
  Smartphone,
  Workflow,
  HelpCircle,
  LoaderCircle
} from 'lucide-react';
import {
  buildOptions,
  currencies,
  emptyBrief,
  startingPoints,
  timelines,
  validateBrief,
  type BriefErrors,
  type ProjectBrief
} from '../lib/project-brief';
import { BriefIllustration } from './BriefIllustration';

const steps = [
  'What should we build?',
  'Tell us about your business.',
  'What are we starting with?',
  'Plan the budget and timing.',
  'Check your project brief.'
];
const icons = [Globe2, Layers3, ShoppingBag, Smartphone, Workflow, HelpCircle];
const fieldsByStep: (keyof ProjectBrief)[][] = [
  ['build'],
  ['company', 'title', 'goals', 'audience'],
  ['startingPoint', 'website', 'features'],
  ['currency', 'budget', 'timeline', 'notes'],
  []
];
const inputClass =
  'mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground focus:ring-1 focus:ring-ring';

export function ProjectBriefWizard({ name }: { name: string }) {
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<ProjectBrief>({ ...emptyBrief });
  const [errors, setErrors] = useState<BriefErrors>({});
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const router = useRouter();

  function update<K extends keyof ProjectBrief>(
    key: K,
    value: ProjectBrief[K]
  ) {
    setBrief((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }
  function navigate(next: number) {
    setStep(next);
    setError('');
    requestAnimationFrame(() => heading.current?.focus());
  }
  function nextStep() {
    const validated = validateBrief(brief).errors;
    const relevant = Object.fromEntries(
      fieldsByStep[step]
        .filter((key) => validated[key])
        .map((key) => [key, validated[key]])
    );
    setErrors(relevant);
    if (Object.keys(relevant).length) {
      setError('Check the highlighted fields before continuing.');
      return;
    }
    navigate(step + 1);
  }
  async function submit() {
    const checked = validateBrief(brief);
    if (Object.keys(checked.errors).length) {
      setErrors(checked.errors);
      navigate(
        fieldsByStep.findIndex((fields) =>
          fields.some((key) => checked.errors[key])
        )
      );
      setError('Check the highlighted fields.');
      return;
    }
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/project-briefs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checked.brief)
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          setError(
            'Your session expired. Open sign-in in a new tab, then return here to submit your answers.'
          );
          return;
        }
        setErrors(result.fields || {});
        setError(
          result.error || 'We could not submit your brief. Please try again.'
        );
        return;
      }
      router.push(`/start-project/requests/${encodeURIComponent(result.id)}`);
    } catch {
      setError(
        'Connection interrupted. Your answers are still here. Please try again.'
      );
    } finally {
      setPending(false);
    }
  }
  function field(
    key:
      | 'company'
      | 'title'
      | 'audience'
      | 'website'
      | 'budget'
      | 'goals'
      | 'features'
      | 'notes',
    label: string,
    placeholder: string,
    multiline = false
  ) {
    const shared = {
      id: 'brief-' + key,
      name: key,
      value: brief[key],
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => update(key, event.target.value),
      placeholder,
      className: inputClass,
      'aria-invalid': Boolean(errors[key]),
      'aria-describedby': errors[key] ? key + '-error' : undefined,
      disabled: pending,
      maxLength:
        key === 'company'
          ? 120
          : key === 'title'
            ? 160
            : key === 'website' || key === 'audience'
              ? 500
              : key === 'budget'
                ? 15
                : 4000
    };
    return (
      <div>
        <label htmlFor={shared.id} className="text-sm font-medium">
          {label}
        </label>
        {multiline ? (
          <textarea {...shared} rows={4} />
        ) : (
          <input
            {...shared}
            type={key === 'website' ? 'url' : 'text'}
            inputMode={key === 'budget' ? 'decimal' : undefined}
          />
        )}
        {errors[key] ? (
          <p id={key + '-error'} className="mt-2 text-xs text-destructive">
            {errors[key]}
          </p>
        ) : null}
      </div>
    );
  }
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {name}, let us shape your project.
        </p>
        <Link
          href="/workspace"
          className="text-xs font-medium underline underline-offset-4"
        >
          Your workspace
        </Link>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        <section>
          <div className="mb-5 flex items-center gap-3">
            <p className="shrink-0 text-xs font-medium text-muted-foreground">
              Step {step + 1} of 5
            </p>
            <div
              role="progressbar"
              aria-label="Project brief steps"
              aria-valuenow={step + 1}
              aria-valuemin={0}
              aria-valuemax={5}
              className="h-1 flex-1 rounded-full bg-border"
            >
              <div
                className="h-full rounded-full bg-foreground transition-[width] motion-reduce:transition-none"
                style={{ width: `${(step + 1) * 20}%` }}
              />
            </div>
          </div>
          <h1
            ref={heading}
            tabIndex={-1}
            className="text-2xl font-semibold leading-tight tracking-tight outline-none sm:text-3xl"
          >
            {steps[step]}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {
              [
                'Choose the closest fit. We can refine the approach together.',
                'The problem and the people come before the software.',
                'Bring the context, tools and features you already have in mind.',
                'A starting budget helps us propose a realistic scope. It is not a fixed quote.',
                'Check the details before sending them to the Rcentz team.'
              ][step]
            }
          </p>
          <div
            aria-hidden="true"
            className="mt-5 flex items-center gap-3 rounded-xl border border-border bg-surface-subtle p-3 lg:hidden"
          >
            <Layers3 className="size-5 shrink-0 text-theme-accent" />
            <p className="min-w-0 truncate text-xs font-medium">
              {brief.title || 'Your project canvas'}
            </p>
            <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
              Plan → Build → Launch
            </span>
          </div>
          <form
            className="mt-7 space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              if (step < 4) nextStep();
              else void submit();
            }}
            noValidate
          >
            {step === 0 ? (
              <fieldset>
                <legend className="sr-only">Choose the type of project</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {buildOptions.map((option, index) => {
                    const Icon = icons[index];
                    return (
                      <label
                        key={option.value}
                        className={[
                          'relative cursor-pointer rounded-xl border p-4 transition-colors',
                          brief.build === option.value
                            ? 'border-foreground bg-surface-muted'
                            : 'border-border hover:bg-surface-subtle',
                          'focus-within:ring-2 focus-within:ring-ring'
                        ].join(' ')}
                      >
                        <input
                          type="radio"
                          name="build"
                          value={option.value}
                          checked={brief.build === option.value}
                          onChange={() => update('build', option.value)}
                          className="sr-only"
                        />
                        <Icon
                          aria-hidden="true"
                          className="size-5 text-theme-accent"
                        />
                        <span className="mt-3 block text-sm font-semibold">
                          {option.title}
                        </span>
                        <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                          {option.detail}
                        </span>
                        {brief.build === option.value ? (
                          <Check
                            aria-hidden="true"
                            className="absolute right-4 top-4 size-4"
                          />
                        ) : null}
                      </label>
                    );
                  })}
                </div>
                {errors.build ? (
                  <p className="mt-3 text-xs text-destructive">
                    {errors.build}
                  </p>
                ) : null}
              </fieldset>
            ) : null}
            {step === 1 ? (
              <>
                {field(
                  'company',
                  'Business or organisation name',
                  'Your company name'
                )}
                {field(
                  'title',
                  'Give your project a name',
                  'Customer operations platform'
                )}
                {field(
                  'goals',
                  'What should this solve for your business?',
                  'What is difficult today, and what would a better result look like?',
                  true
                )}
                {field(
                  'audience',
                  'Who will use it?',
                  'Customers, your team, partners, or a combination'
                )}
              </>
            ) : null}
            {step === 2 ? (
              <>
                <fieldset>
                  <legend className="text-sm font-medium">
                    Your starting point
                  </legend>
                  <div className="mt-3 space-y-2">
                    {startingPoints.map((value) => (
                      <label
                        key={value}
                        className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border px-3"
                      >
                        <input
                          type="radio"
                          name="starting-point"
                          value={value}
                          checked={brief.startingPoint === value}
                          onChange={() => update('startingPoint', value)}
                          className="accent-foreground"
                        />
                        <span className="text-sm">{value}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                {field(
                  'website',
                  'Existing website or application link (optional)',
                  'https://your-company.com'
                )}
                {field(
                  'features',
                  'What must the first version include?',
                  'Accounts, bookings, reports, approvals, payments, integrations…',
                  true
                )}
                <p className="text-xs leading-5 text-muted-foreground">
                  Share public links here. Access details and project files can
                  be arranged after scope review.
                </p>
              </>
            ) : null}
            {step === 3 ? (
              <>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4">
                  <input
                    type="checkbox"
                    checked={brief.guidance}
                    onChange={(event) =>
                      update('guidance', event.target.checked)
                    }
                  />
                  <span className="text-sm">
                    I would like help setting a budget.
                  </span>
                </label>
                <div>
                  <label
                    htmlFor="brief-currency"
                    className="text-sm font-medium"
                  >
                    Budget currency
                  </label>
                  <select
                    id="brief-currency"
                    className={inputClass}
                    value={brief.currency}
                    onChange={(event) => update('currency', event.target.value)}
                  >
                    {currencies.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>
                {!brief.guidance
                  ? field('budget', 'Your starting budget', 'Enter an amount')
                  : null}
                <div>
                  <label
                    htmlFor="brief-timeline"
                    className="text-sm font-medium"
                  >
                    When would you like it ready?
                  </label>
                  <select
                    id="brief-timeline"
                    className={inputClass}
                    value={brief.timeline}
                    onChange={(event) => update('timeline', event.target.value)}
                  >
                    {timelines.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>
                <label className="flex cursor-pointer items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={brief.ongoingSupport}
                    onChange={(event) =>
                      update('ongoingSupport', event.target.checked)
                    }
                  />
                  Include ongoing support in our discussion.
                </label>
                {field(
                  'notes',
                  'Anything else we should know? (optional)',
                  'Constraints, important dates, references or questions.',
                  true
                )}
              </>
            ) : null}
            {step === 4 ? (
              <dl className="divide-y divide-border rounded-xl border border-border px-4">
                {[
                  [
                    'Build',
                    buildOptions.find((option) => option.value === brief.build)
                      ?.title
                  ],
                  ['Business', brief.company],
                  ['Project', brief.title],
                  ['Goals', brief.goals],
                  ['Audience', brief.audience],
                  ['Starting point', brief.startingPoint],
                  ['Existing link', brief.website || 'Not provided'],
                  ['Must-have features', brief.features],
                  [
                    'Budget',
                    brief.guidance
                      ? 'Please advise'
                      : `${brief.currency} ${brief.budget}`
                  ],
                  ['Timeline', brief.timeline],
                  [
                    'Ongoing support',
                    brief.ongoingSupport
                      ? 'Include in discussion'
                      : 'Not requested yet'
                  ],
                  ['Additional notes', brief.notes || 'None']
                ].map(([label, value]) => (
                  <div key={label} className="py-3">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 p-4 text-sm leading-6 text-destructive"
              >
                {error}
                {error.startsWith('Your session') ? (
                  <a
                    href="/login?next=%2Fstart-project"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block underline"
                  >
                    Sign in in a new tab
                  </a>
                ) : null}
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
              {step > 0 ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => navigate(step - 1)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm disabled:opacity-50"
                >
                  <ArrowLeft aria-hidden="true" className="size-4" />
                  Back
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Your brief is private.
                </span>
              )}
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background disabled:opacity-50"
              >
                {pending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                ) : null}
                {step === 4
                  ? pending
                    ? 'Submitting…'
                    : 'Submit project brief'
                  : 'Continue'}
                {!pending ? (
                  <ArrowRight aria-hidden="true" className="size-4" />
                ) : null}
              </button>
            </div>
          </form>
        </section>
        <aside className="hidden lg:block">
          <BriefIllustration
            step={step}
            title={brief.title}
            company={brief.company}
          />
          <p className="mt-4 text-xs leading-6 text-muted-foreground">
            Submitting a brief starts a scope conversation. We agree
            requirements, delivery milestones and project costs before
            development begins.
          </p>
        </aside>
      </div>
    </main>
  );
}
