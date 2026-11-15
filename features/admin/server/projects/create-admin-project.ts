'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/features/auth/server/require-admin';
import {
  isAdminProjectCurrency,
  isAdminProjectType,
  isAdminProjectVisibility
} from '@/features/admin/types/projects';

export type CreateAdminProjectState = { error: string | null };

type MilestoneRegistration = {
  title: string;
  description: string;
  purpose: string;
  expectedOutcome: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  visibility: 'INTERNAL' | 'CLIENT' | 'PUBLIC';
  dueDate: Date | null;
  criteria: string[];
  slug: string;
};

const priorityOptions = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];
const visibilityOptions = ['INTERNAL', 'CLIENT', 'PUBLIC'];

function getText(data: FormData, key: string) {
  const value = data.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function toSlug(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function parseDate(value: string): Date | null | undefined {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value
    ? undefined
    : date;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseMilestones(raw: string):
  | { ok: true; milestones: MilestoneRegistration[] }
  | { ok: false; error: string } {
  if (raw.length > 24000) return { ok: false, error: 'The milestone plan is too large.' };
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'The milestone plan could not be read.' };
  }
  if (!Array.isArray(value) || value.length < 1 || value.length > 6) {
    return { ok: false, error: 'Include between one and six initial milestones.' };
  }
  const usedSlugs = new Set<string>();
  const milestones: MilestoneRegistration[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    if (!isRecord(item)) return { ok: false, error: `Milestone ${index + 1} is invalid.` };
    const read = (key: string) => typeof item[key] === 'string' ? (item[key] as string).trim() : '';
    const title = read('title');
    const description = read('description');
    const purpose = read('purpose');
    const expectedOutcome = read('expectedOutcome');
    const priority = read('priority');
    const visibility = read('visibility');
    const dueDate = parseDate(read('dueDate'));
    const slug = toSlug(title);
    if (title.length < 3 || title.length > 160 || slug.length < 2 || usedSlugs.has(slug)) {
      return { ok: false, error: `Milestone ${index + 1} needs a unique title of 3–160 characters.` };
    }
    if (description.length > 2000 || purpose.length > 2000 || expectedOutcome.length > 2000) {
      return { ok: false, error: `Milestone ${index + 1} contains overly long text.` };
    }
    if (!priorityOptions.includes(priority) || !visibilityOptions.includes(visibility)) {
      return { ok: false, error: `Milestone ${index + 1} has an invalid priority or visibility.` };
    }
    if (dueDate === undefined) {
      return { ok: false, error: `Milestone ${index + 1} has an invalid due date.` };
    }
    const criteriaValue = item.criteria;
    if (!Array.isArray(criteriaValue) || criteriaValue.length < 1 || criteriaValue.length > 6 ||
      criteriaValue.some(c => typeof c !== 'string' || c.trim().length < 3 || c.trim().length > 160)) {
      return { ok: false, error: `Milestone ${index + 1} needs 1–6 measurable completion criteria.` };
    }
    const criteria = (criteriaValue as string[]).map(c => c.trim());
    if (new Set(criteria.map(c => c.toLowerCase())).size !== criteria.length) {
      return { ok: false, error: `Milestone ${index + 1} has duplicate completion criteria.` };
    }
    usedSlugs.add(slug);
    milestones.push({
      title,
      slug,
      description,
      purpose,
      expectedOutcome,
      priority: priority as MilestoneRegistration['priority'],
      visibility: visibility as MilestoneRegistration['visibility'],
      dueDate,
      criteria
    });
  }
  return { ok: true, milestones };
}

export async function createAdminProject(
  _previousState: CreateAdminProjectState,
  formData: FormData
): Promise<CreateAdminProjectState> {
  const admin = await requireAdmin();
  const name = getText(formData, 'name');
  const slug = toSlug(getText(formData, 'slug') || name);
  const clientId = getText(formData, 'clientId');
  const type = getText(formData, 'type');
  const visibility = getText(formData, 'visibility');
  const description = getText(formData, 'description');
  const purpose = getText(formData, 'purpose');
  const vision = getText(formData, 'vision');
  const expectedOutcome = getText(formData, 'expectedOutcome');
  const budgetText = getText(formData, 'budget');
  const currency = getText(formData, 'currency').toUpperCase();
  const startedAt = parseDate(getText(formData, 'startedAt'));
  const expectedEndAt = parseDate(getText(formData, 'expectedEndAt'));
  const milestonePlan = parseMilestones(getText(formData, 'milestonesJson'));

  if (name.length < 2 || name.length > 160 || slug.length < 2) {
    return { error: 'Enter a project name of 2–160 characters and a valid slug.' };
  }
  if (!isAdminProjectType(type) || !isAdminProjectVisibility(visibility) ||
      !isAdminProjectCurrency(currency)) {
    return { error: 'Choose valid project type, visibility, and currency settings.' };
  }
  if ([description, purpose, vision, expectedOutcome].some(value => value.length > 5000)) {
    return { error: 'Project description, purpose, vision and outcome must be under 5,000 characters each.' };
  }
  if (description.length < 20) {
    return { error: 'Provide at least 20 characters describing the agreed project scope.' };
  }
  if (budgetText && !/^\d{1,12}(\.\d{1,2})?$/.test(budgetText)) {
    return { error: 'Enter a valid agreed budget with up to two decimal places.' };
  }
  if (startedAt === undefined || expectedEndAt === undefined ||
      (startedAt && expectedEndAt && expectedEndAt < startedAt)) {
    return { error: 'Check the project dates. Completion cannot be before the start date.' };
  }
  if (!milestonePlan.ok) return { error: milestonePlan.error };
  let registeredId: string;
  try {
    // Validate the referenced account before opening a write transaction.
    if (clientId) {
      const client = await prisma.user.findFirst({
        where: { id: clientId, role: 'CLIENT', status: 'ACTIVE' }, select: { id: true }
      });
      if (!client) return { error: 'The selected client is no longer available.' };
    }
    const existing = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (existing) return { error: 'Another project already uses this slug.' };

    const registered = await prisma.$transaction(async tx => {
      // Initial registration is atomic; no GitHub/API request happens inside the transaction.
      const project = await tx.project.create({
        data: {
          clientId: clientId || null,
          name,
          slug,
          description,
          purpose: purpose || null,
          vision: vision || null,
          expectedOutcome: expectedOutcome || null,
          type,
          status: 'PLANNING',
          visibility,
          progress: 0,
          budget: budgetText || null,
          currency,
          startedAt,
          expectedEndAt
        },
        select: { id: true }
      });
      await tx.projectAssignment.create({
        data: { projectId: project.id, userId: admin.id, role: 'PROJECT_ADMIN' }
      });
      const createdMilestones = await tx.projectMilestone.createManyAndReturn({
        data: milestonePlan.milestones.map((milestone, index) => ({
          projectId: project.id,
          createdById: admin.id,
          title: milestone.title,
          slug: milestone.slug,
          description: milestone.description || null,
          purpose: milestone.purpose || null,
          expectedOutcome: milestone.expectedOutcome || null,
          priority: milestone.priority,
          visibility: milestone.visibility,
          sortOrder: index,
          status: 'PLANNED',
          progress: 0,
          dueDate: milestone.dueDate
        })),
        select: { id: true, slug: true }
      });
      const bySlug = new Map(createdMilestones.map(item => [item.slug, item.id]));
      await tx.projectMilestoneCriterion.createMany({
        data: milestonePlan.milestones.flatMap(milestone =>
          milestone.criteria.map((title, index) => ({
            milestoneId: bySlug.get(milestone.slug)!,
            title,
            sortOrder: index,
            required: true,
            verified: false,
            revision: 1
          }))
        )
      });
      await tx.projectActivity.create({
        data: {
          projectId: project.id,
          userId: admin.id,
          type: 'CREATED',
          title: 'Project registered with initial milestones',
          visibility: 'CLIENT',
          metadata: { milestoneCount: milestonePlan.milestones.length, source: 'ADMIN_REGISTRATION_R2' }
        }
      });
      await tx.auditLog.create({
        data: {
          userId: admin.id,
          action: 'PROJECT_REGISTERED_WITH_MILESTONES',
          entityType: 'Project',
          entityId: project.id,
          metadata: { milestoneCount: milestonePlan.milestones.length, clientId: clientId || null }
        }
      });
      if (clientId) {
        await tx.notification.create({
          data: {
            userId: clientId,
            type: 'PROJECT',
            title: 'Your project workspace is ready',
            message: `${name} has been registered with its initial delivery milestones.`,
            href: `/dashboard/projects/${project.id}`,
            entityType: 'PROJECT',
            entityId: project.id
          }
        });
      }
      return project;
    }, { maxWait: 10000, timeout: 30000 });

    registeredId = registered.id;
  } catch (error) {
    // Never disclose internal database information to a browser.
    console.error('[project-registration-r2] Registration failed:', error);
    return { error: 'Could not register the project. No partial project should have been saved. Check server logs.' };
  }
  revalidatePath('/admin');
  revalidatePath('/admin/projects');
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/projects');
  redirect(`/admin/projects/${registeredId}`);
}
