/** Public quote/enquiry contract. Keep in sync with Systems' intake contract. */
export const CONTACT_PURPOSES = ['QUOTE', 'GENERAL', 'PRODUCT', 'PARTNERSHIP', 'MEDIA', 'OTHER'] as const;
export const PROJECT_TYPES = ['WEBSITE', 'WEB_APP', 'MOBILE_APP', 'ECOMMERCE', 'BUSINESS_SYSTEM', 'CONSULTING', 'OTHER'] as const;
export const PROJECT_TIMELINES = ['ASAP', 'ONE_TO_THREE_MONTHS', 'THREE_TO_SIX_MONTHS', 'FLEXIBLE'] as const;

export type ContactPurpose = (typeof CONTACT_PURPOSES)[number];
export type ProjectType = (typeof PROJECT_TYPES)[number];
export type ProjectTimeline = (typeof PROJECT_TIMELINES)[number];

export type PublicEnquiryInput = {
  submissionId: string;
  purpose: ContactPurpose;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  projectType: ProjectType | null;
  budgetNote: string | null;
  timeline: ProjectTimeline | null;
  message: string;
  consent: true;
};

function text(value: unknown, limit: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length > limit || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(trimmed)) return null;
  return trimmed;
}

function optional(value: unknown, limit: number): string | null | undefined {
  if (value === '' || value === null || value === undefined) return null;
  return text(value, limit) ?? undefined;
}

export function validatePublicEnquiry(value: unknown): PublicEnquiryInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const v = value as Record<string, unknown>;
  const submissionId = text(v.submissionId, 36);
  const name = text(v.name, 120);
  const email = text(v.email, 254)?.toLowerCase();
  const message = text(v.message, 4000);
  const company = optional(v.company, 120);
  const phone = optional(v.phone, 40);
  const budgetNote = optional(v.budgetNote, 100);
  if (!submissionId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(submissionId)) return null;
  if (!name || name.length < 2 || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return null;
  if (!message || message.length < 40 || company === undefined || phone === undefined || budgetNote === undefined || v.consent !== true) return null;
  if (!CONTACT_PURPOSES.includes(v.purpose as ContactPurpose)) return null;
  const quote = v.purpose === 'QUOTE';
  const projectType = quote ? (v.projectType ?? null) : null;
  const timeline = quote ? (v.timeline ?? null) : null;
  if (projectType !== null && !PROJECT_TYPES.includes(projectType as ProjectType)) return null;
  if (timeline !== null && !PROJECT_TIMELINES.includes(timeline as ProjectTimeline)) return null;
  return {
    submissionId,
    purpose: v.purpose as ContactPurpose,
    name,
    email,
    company,
    phone,
    projectType: projectType as ProjectType | null,
    budgetNote: quote ? budgetNote : null,
    timeline: timeline as ProjectTimeline | null,
    message,
    consent: true,
  };
}
