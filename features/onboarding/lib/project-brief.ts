export const buildOptions = [
  {
    value: 'website',
    title: 'Business website',
    detail: 'A clear home for your business and services.',
    service: 'business-website-development'
  },
  {
    value: 'application',
    title: 'Web application',
    detail: 'Accounts, dashboards and tailored workflows.',
    service: 'custom-web-application-development'
  },
  {
    value: 'commerce',
    title: 'Commerce platform',
    detail: 'Products, orders and customer journeys.',
    service: 'ecommerce-store-development'
  },
  {
    value: 'mobile',
    title: 'Mobile application',
    detail: 'An application designed for phones and tablets.',
    service: 'mobile-application-development'
  },
  {
    value: 'automation',
    title: 'Workflow automation',
    detail: 'Connect your tools and reduce repetitive work.',
    service: 'internal-operations-system'
  },
  {
    value: 'guidance',
    title: 'Help me decide',
    detail: 'Start with the problem. We will explore the approach.',
    service: 'custom-web-application-development'
  }
] as const;
export const currencies = ['NGN', 'USD', 'GBP', 'EUR'] as const;
export const timelines = [
  'Flexible',
  'Within 1–2 months',
  'Within 3–4 months',
  'Within 6 months'
] as const;
export const startingPoints = [
  'Starting fresh',
  'Replacing an existing system',
  'Improving an existing system'
] as const;
export type ProjectBrief = {
  build: string;
  company: string;
  title: string;
  goals: string;
  audience: string;
  startingPoint: string;
  website: string;
  features: string;
  currency: string;
  budget: string;
  guidance: boolean;
  timeline: string;
  notes: string;
  ongoingSupport: boolean;
};
export const emptyBrief: ProjectBrief = {
  build: '',
  company: '',
  title: '',
  goals: '',
  audience: '',
  startingPoint: 'Starting fresh',
  website: '',
  features: '',
  currency: 'NGN',
  budget: '',
  guidance: true,
  timeline: 'Flexible',
  notes: '',
  ongoingSupport: false
};
export type BriefErrors = Partial<Record<keyof ProjectBrief, string>>;

export function validateBrief(input: unknown): {
  brief: ProjectBrief;
  errors: BriefErrors;
} {
  const source =
    input && typeof input === 'object' && !Array.isArray(input)
      ? (input as Record<string, unknown>)
      : {};
  const brief = Object.fromEntries(
    Object.keys(emptyBrief).map((key) => [
      key,
      typeof emptyBrief[key as keyof ProjectBrief] === 'boolean'
        ? source[key] === true
        : typeof source[key] === 'string'
          ? source[key].trim()
          : ''
    ])
  ) as ProjectBrief;
  const errors: BriefErrors = {};
  if (!buildOptions.some((option) => option.value === brief.build))
    errors.build = 'Choose what you would like to build.';
  for (const [key, min, max, label] of [
    ['company', 2, 120, 'Business name'],
    ['title', 3, 160, 'Project name'],
    ['goals', 20, 4000, 'Project goals'],
    ['audience', 3, 500, 'Who will use it'],
    ['features', 10, 4000, 'Must-have features']
  ] as const) {
    if (brief[key].length < min || brief[key].length > max)
      errors[key] = `${label} needs ${min}–${max} characters.`;
  }
  if (!startingPoints.some((value) => value === brief.startingPoint))
    errors.startingPoint = 'Choose a starting point.';
  if (brief.website) {
    try {
      const url = new URL(brief.website);
      if (
        !['http:', 'https:'].includes(url.protocol) ||
        brief.website.length > 500
      )
        throw new Error();
    } catch {
      errors.website = 'Enter a complete http:// or https:// website address.';
    }
  }
  if (!currencies.some((value) => value === brief.currency))
    errors.currency = 'Choose a supported currency.';
  if (
    !brief.guidance &&
    (!/^\d{1,12}(\.\d{1,2})?$/.test(brief.budget) || Number(brief.budget) <= 0)
  )
    errors.budget =
      'Enter a positive budget with up to two decimal places, or ask for guidance.';
  if (!timelines.some((value) => value === brief.timeline))
    errors.timeline = 'Choose a timeline.';
  if (brief.notes.length > 4000)
    errors.notes = 'Keep additional notes within 4,000 characters.';
  return { brief, errors };
}

export function describeBrief(brief: ProjectBrief) {
  return [
    `Business: ${brief.company}`,
    `Build: ${buildOptions.find((option) => option.value === brief.build)?.title}`,
    `Goals:\n${brief.goals}`,
    `Who will use it:\n${brief.audience}`,
    `Starting point: ${brief.startingPoint}`,
    `Existing website: ${brief.website || 'Not provided'}`,
    `Must-have features:\n${brief.features}`,
    `Budget: ${brief.guidance ? 'Please advise on budget' : `${brief.currency} ${brief.budget}`}`,
    `Timing: ${brief.timeline}`,
    `Ongoing support: ${brief.ongoingSupport ? 'Please include in the discussion' : 'Not requested yet'}`,
    `Additional notes:\n${brief.notes || 'None'}`
  ].join('\n\n');
}
