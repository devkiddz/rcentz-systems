import 'server-only';
import type { Prisma } from '@/generated/prisma/client';
import {
  emptyBrief,
  buildOptions,
  validateBrief,
  type ProjectBrief
} from '../lib/project-brief';
export const BRIEF_KEY = '_rcentz_project_brief_v1';
export type BriefAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  pathname: string;
};
export type BriefData = {
  version: 1;
  brief: ProjectBrief;
  attachments: BriefAttachment[];
};
export function readBriefData(metadata: unknown): BriefData | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata))
    return null;
  const data = metadata as Record<string, unknown>;
  if (data.version !== 1 || !data.brief || !Array.isArray(data.attachments))
    return null;
  return {
    version: 1,
    brief: validateBrief(data.brief).brief,
    attachments: data.attachments as BriefAttachment[]
  };
}
export async function writeBriefData(
  tx: Prisma.TransactionClient,
  request: { id: string; serviceId: string },
  data: BriefData
) {
  const question = await tx.serviceOnboardingQuestion.upsert({
    where: { serviceId_key: { serviceId: request.serviceId, key: BRIEF_KEY } },
    create: {
      serviceId: request.serviceId,
      key: BRIEF_KEY,
      label: 'Project brief workspace',
      type: 'LONG_TEXT',
      active: false
    },
    update: {}
  });
  await tx.serviceRequestAnswer.deleteMany({
    where: {
      serviceRequestId: request.id,
      question: { key: BRIEF_KEY },
      questionId: { not: question.id }
    }
  });
  await tx.serviceRequestAnswer.upsert({
    where: {
      serviceRequestId_questionId: {
        serviceRequestId: request.id,
        questionId: question.id
      }
    },
    create: {
      serviceRequestId: request.id,
      questionId: question.id,
      questionLabel: question.label,
      questionType: question.type,
      metadata: JSON.parse(JSON.stringify(data))
    },
    update: { metadata: JSON.parse(JSON.stringify(data)) }
  });
}
export function legacyBrief(request: {
  title: string;
  description: string;
  currency: string;
  budget: { toString(): string } | null;
  service: { slug: string };
}): ProjectBrief {
  const parts = request.description.split(
    /\n\n(?=Business:|Build:|Goals:|Who will use it:|Starting point:|Existing website:|Must-have features:|Budget:|Timing:|Ongoing support:|Additional notes:)/
  );
  const value = (label: string) =>
    parts
      .find((part) => part.startsWith(label))
      ?.slice(label.length)
      .trim() || '';
  return {
    ...emptyBrief,
    build:
      buildOptions.find((option) => option.service === request.service.slug)
        ?.value || 'guidance',
    title: request.title,
    company: value('Business:'),
    goals: value('Goals:'),
    audience: value('Who will use it:'),
    startingPoint: value('Starting point:') || emptyBrief.startingPoint,
    website:
      value('Existing website:') === 'Not provided'
        ? ''
        : value('Existing website:'),
    features: value('Must-have features:'),
    currency: request.currency,
    budget: request.budget?.toString() || '',
    guidance: !request.budget,
    timeline: value('Timing:') || 'Flexible',
    ongoingSupport: value('Ongoing support:').startsWith('Please include'),
    notes:
      value('Additional notes:') === 'None' ? '' : value('Additional notes:')
  };
}
export function uploadsConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}
