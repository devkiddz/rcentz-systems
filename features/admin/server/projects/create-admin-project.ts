'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { prisma } from '@/lib/prisma';

import { requireAdmin } from '@/features/auth/server/require-admin';

import {
  isAdminProjectCurrency,
  isAdminProjectStatus,
  isAdminProjectType,
  isAdminProjectVisibility
} from '@/features/admin/types/projects';

export type CreateAdminProjectState = {
  error: string | null;
};

function getText(
  formData: FormData,
  key: string
) {
  const value = formData.get(key);

  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function createSlug(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function parseDate(
  value: string
): Date | null | undefined {
  if (!value) {
    return null;
  }

  const date = new Date(
    `${value}T12:00:00.000Z`
  );

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

export async function createAdminProject(
  _previousState: CreateAdminProjectState,
  formData: FormData
): Promise<CreateAdminProjectState> {
  await requireAdmin();

  const name = getText(
    formData,
    'name'
  );

  const rawSlug = getText(
    formData,
    'slug'
  );

  const clientId = getText(
    formData,
    'clientId'
  );

  const description = getText(
    formData,
    'description'
  );

  const purpose = getText(
    formData,
    'purpose'
  );

  const vision = getText(
    formData,
    'vision'
  );

  const expectedOutcome = getText(
    formData,
    'expectedOutcome'
  );

  const type = getText(
    formData,
    'type'
  );

  const status = getText(
    formData,
    'status'
  );

  const visibility = getText(
    formData,
    'visibility'
  );

  const progressText = getText(
    formData,
    'progress'
  );

  const budgetText = getText(
    formData,
    'budget'
  );

  const currency = getText(
    formData,
    'currency'
  ).toUpperCase();

  const startedAtText = getText(
    formData,
    'startedAt'
  );

  const expectedEndAtText = getText(
    formData,
    'expectedEndAt'
  );

  if (
    name.length < 2 ||
    name.length > 160
  ) {
    return {
      error:
        'Project name must be between 2 and 160 characters.'
    };
  }

  const slug = createSlug(
    rawSlug || name
  );

  if (
    slug.length < 2 ||
    slug.length > 120
  ) {
    return {
      error:
        'Enter a valid project slug.'
    };
  }

  if (!isAdminProjectType(type)) {
    return {
      error:
        'Select a valid project type.'
    };
  }

  if (
    !isAdminProjectStatus(status)
  ) {
    return {
      error:
        'Select a valid project status.'
    };
  }

  if (
    !isAdminProjectVisibility(
      visibility
    )
  ) {
    return {
      error:
        'Select a valid project visibility.'
    };
  }

  if (
    !isAdminProjectCurrency(currency)
  ) {
    return {
      error:
        'Select a supported project currency.'
    };
  }

  const progress = Number(
    progressText || '0'
  );

  if (
    !Number.isInteger(progress) ||
    progress < 0 ||
    progress > 100
  ) {
    return {
      error:
        'Project progress must be a whole number between 0 and 100.'
    };
  }

  let budget: number | null = null;

  if (budgetText) {
    const parsedBudget =
      Number(budgetText);

    if (
      !Number.isFinite(
        parsedBudget
      ) ||
      parsedBudget < 0
    ) {
      return {
        error:
          'Project budget must be a valid positive amount.'
      };
    }

    budget = parsedBudget;
  }

  if (description.length > 5000) {
    return {
      error:
        'Project description is too long.'
    };
  }

  if (purpose.length > 5000) {
    return {
      error:
        'Project purpose is too long.'
    };
  }

  if (vision.length > 5000) {
    return {
      error:
        'Project vision is too long.'
    };
  }

  if (
    expectedOutcome.length > 5000
  ) {
    return {
      error:
        'Expected outcome is too long.'
    };
  }

  const startedAt = parseDate(
    startedAtText
  );

  const expectedEndAt = parseDate(
    expectedEndAtText
  );

  if (startedAt === undefined) {
    return {
      error:
        'Enter a valid project start date.'
    };
  }

  if (
    expectedEndAt === undefined
  ) {
    return {
      error:
        'Enter a valid expected completion date.'
    };
  }

  if (
    startedAt &&
    expectedEndAt &&
    expectedEndAt.getTime() <
      startedAt.getTime()
  ) {
    return {
      error:
        'Expected completion cannot be before the project start date.'
    };
  }

  const existingSlug =
    await prisma.project.findUnique({
      where: {
        slug
      },

      select: {
        id: true
      }
    });

  if (existingSlug) {
    return {
      error:
        'Another project already uses this slug.'
    };
  }

  if (clientId) {
    const client =
      await prisma.user.findFirst({
        where: {
          id: clientId,
          role: 'CLIENT',
          status: 'ACTIVE'
        },

        select: {
          id: true
        }
      });

    if (!client) {
      return {
        error:
          'The selected client is no longer available.'
      };
    }
  }

  const createdProject = await prisma.project.create({
    data: {
      clientId:
        clientId || null,

      name,
      slug,

      description:
        description || null,

      purpose:
        purpose || null,

      vision:
        vision || null,

      expectedOutcome:
        expectedOutcome || null,

      type,
      status,
      visibility,

      progress,

      budget,
      currency,

      startedAt,
      expectedEndAt,

      completedAt:
        status === 'COMPLETED'
          ? new Date()
          : null
    },

    select: {
      id: true
    }
  });

  revalidatePath('/admin');
  revalidatePath(
    '/admin/projects'
  );

  if (clientId) {
    revalidatePath('/dashboard');
    revalidatePath(
      '/dashboard/projects'
    );
  }

  redirect(`/admin/projects/${createdProject.id}/sources`);
}