'use server';

import {
  revalidatePath
} from 'next/cache';

import {
  redirect
} from 'next/navigation';

import {
  prisma
} from '@/lib/prisma';

import {
  requireAdmin
} from '@/features/auth/server/require-admin';

import {
  isAdminProjectCurrency,
  isAdminProjectStatus,
  isAdminProjectType,
  isAdminProjectVisibility
} from '@/features/admin/types/projects';

export type UpdateAdminProjectState = {
  error: string | null;
};

function getText(
  formData: FormData,
  key: string
) {
  const value =
    formData.get(key);

  if (
    typeof value !==
    'string'
  ) {
    return '';
  }

  return value.trim();
}

function createSlug(
  value: string
) {
  return value
    .normalize('NFKD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      ''
    )
    .slice(0, 120);
}

function parseDate(
  value: string
):
  | Date
  | null
  | undefined {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      `${value}T12:00:00.000Z`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return undefined;
  }

  return date;
}

function parseHttpsUrl(value: string): string | null | undefined {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.href.length > 500) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
}

export async function updateAdminProject(
  _previousState: UpdateAdminProjectState,
  formData: FormData
): Promise<UpdateAdminProjectState> {
  const actor = await requireAdmin();

  const projectId =
    getText(
      formData,
      'projectId'
    );

  const name =
    getText(
      formData,
      'name'
    );

  const rawSlug =
    getText(
      formData,
      'slug'
    );

  const clientId =
    getText(
      formData,
      'clientId'
    );

  const description =
    getText(
      formData,
      'description'
    );

  const purpose =
    getText(
      formData,
      'purpose'
    );

  const vision =
    getText(
      formData,
      'vision'
    );

  const expectedOutcome =
    getText(
      formData,
      'expectedOutcome'
    );

  const type =
    getText(
      formData,
      'type'
    );

  const status =
    getText(
      formData,
      'status'
    );

  const visibility =
    getText(
      formData,
      'visibility'
    );



  const budgetText =
    getText(
      formData,
      'budget'
    );

  const currency =
    getText(
      formData,
      'currency'
    ).toUpperCase();

  const startedAtText =
    getText(
      formData,
      'startedAt'
    );

  const expectedEndAtText =
    getText(
      formData,
      'expectedEndAt'
    );

  const liveUrlText = getText(formData, 'liveUrl');
  const repositoryUrlText = getText(formData, 'repositoryUrl');
  const primaryDomain = getText(formData, 'primaryDomain').toLowerCase();
  const domainRegistrar = getText(formData, 'domainRegistrar');
  const dnsProvider = getText(formData, 'dnsProvider');
  const hostingProvider = getText(formData, 'hostingProvider');
  const hostingRegion = getText(formData, 'hostingRegion');
  const databaseProvider = getText(formData, 'databaseProvider');
  const storageProvider = getText(formData, 'storageProvider');
  const emailProvider = getText(formData, 'emailProvider');
  const sslProvider = getText(formData, 'sslProvider');
  const infrastructureNotes = getText(formData, 'infrastructureNotes');

  if (!projectId) {
    return {
      error:
        'Project reference is missing.'
    };
  }

  const currentProject =
    await prisma.project.findUnique({
      where: {
        id: projectId
      },

      select: {
        id: true,
        slug: true,
        clientId: true,
        name: true,
        description: true,
        purpose: true,
        vision: true,
        expectedOutcome: true,
        type: true,
        status: true,
        visibility: true,
        budget: true,
        currency: true,
        startedAt: true,
        expectedEndAt: true,
        completedAt: true,
        portfolio: {
          select: { liveUrl: true, repositoryUrl: true }
        },
        infrastructure: {
          select: {
            primaryDomain: true, domainRegistrar: true, dnsProvider: true,
            hostingProvider: true, hostingRegion: true, databaseProvider: true,
            storageProvider: true, emailProvider: true, sslProvider: true, notes: true
          }
        }
      }
    });

  if (!currentProject) {
    return {
      error:
        'Project could not be found.'
    };
  }

  if (
    name.length < 2 ||
    name.length > 160
  ) {
    return {
      error:
        'Project name must be between 2 and 160 characters.'
    };
  }

  const slug =
    createSlug(
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

  if (
    !isAdminProjectType(
      type
    )
  ) {
    return {
      error:
        'Select a valid project type.'
    };
  }

  if (
    !isAdminProjectStatus(
      status
    )
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
    !isAdminProjectCurrency(
      currency
    )
  ) {
    return {
      error:
        'Select a supported project currency.'
    };
  }



  const liveUrl = parseHttpsUrl(liveUrlText);
  const repositoryUrl = parseHttpsUrl(repositoryUrlText);
  if (liveUrl === undefined) {
    return { error: 'Enter a valid HTTPS live website URL.' };
  }
  if (repositoryUrl === undefined || (
    repositoryUrl !== null &&
    !/^https:\/\/github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+\/?$/.test(repositoryUrl)
  )) {
    return { error: 'Enter an HTTPS GitHub repository URL (owner/repository).' };
  }
  if (primaryDomain && (
    primaryDomain.length > 253 ||
    !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(primaryDomain)
  )) {
    return { error: 'Primary domain must be a hostname such as example.com.' };
  }
  const infrastructureFields: Array<[string, string, number]> = [
    ['Domain registrar', domainRegistrar, 160],
    ['DNS provider', dnsProvider, 160],
    ['Hosting provider', hostingProvider, 160],
    ['Hosting region', hostingRegion, 160],
    ['Database provider', databaseProvider, 160],
    ['Storage provider', storageProvider, 160],
    ['Email provider', emailProvider, 160],
    ['SSL provider', sslProvider, 160],
    ['Infrastructure notes', infrastructureNotes, 2000]
  ];
  for (const [label, value, max] of infrastructureFields) {
    if (value.length > max) return { error: `${label} is too long.` };
  }

  let budget:
    | number
    | null = null;

  if (budgetText) {
    const parsedBudget =
      Number(
        budgetText
      );

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

    budget =
      parsedBudget;
  }

  if (
    description.length >
    5000
  ) {
    return {
      error:
        'Project description is too long.'
    };
  }

  if (
    purpose.length >
    5000
  ) {
    return {
      error:
        'Project purpose is too long.'
    };
  }

  if (
    vision.length >
    5000
  ) {
    return {
      error:
        'Project vision is too long.'
    };
  }

  if (
    expectedOutcome.length >
    5000
  ) {
    return {
      error:
        'Expected outcome is too long.'
    };
  }

  const startedAt =
    parseDate(
      startedAtText
    );

  const expectedEndAt =
    parseDate(
      expectedEndAtText
    );

  if (
    startedAt ===
    undefined
  ) {
    return {
      error:
        'Enter a valid project start date.'
    };
  }

  if (
    expectedEndAt ===
    undefined
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

  const duplicateSlug =
    await prisma.project.findFirst({
      where: {
        slug,

        id: {
          not: projectId
        }
      },

      select: {
        id: true
      }
    });

  if (duplicateSlug) {
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

  const completedAt =
    status ===
    'COMPLETED'
      ? currentProject.completedAt ??
        new Date()
      : null;

  const portfolioData = {
    liveUrl,
    repositoryUrl
  };
  const infrastructureData = {
    primaryDomain: primaryDomain || null,
    domainRegistrar: domainRegistrar || null,
    dnsProvider: dnsProvider || null,
    hostingProvider: hostingProvider || null,
    hostingRegion: hostingRegion || null,
    databaseProvider: databaseProvider || null,
    storageProvider: storageProvider || null,
    emailProvider: emailProvider || null,
    sslProvider: sslProvider || null,
    notes: infrastructureNotes || null
  };

  const previous: Record<string, string> = {
    name: currentProject.name,
    slug: currentProject.slug,
    clientId: currentProject.clientId ?? '',
    description: currentProject.description ?? '',
    purpose: currentProject.purpose ?? '',
    vision: currentProject.vision ?? '',
    expectedOutcome: currentProject.expectedOutcome ?? '',
    type: currentProject.type,
    status: currentProject.status,
    visibility: currentProject.visibility,
    budget: currentProject.budget?.toString() ?? '',
    currency: currentProject.currency,
    startedAt: currentProject.startedAt?.toISOString().slice(0, 10) ?? '',
    expectedEndAt: currentProject.expectedEndAt?.toISOString().slice(0, 10) ?? '',
    liveUrl: currentProject.portfolio?.liveUrl ?? '',
    repositoryUrl: currentProject.portfolio?.repositoryUrl ?? '',
    primaryDomain: currentProject.infrastructure?.primaryDomain ?? '',
    domainRegistrar: currentProject.infrastructure?.domainRegistrar ?? '',
    dnsProvider: currentProject.infrastructure?.dnsProvider ?? '',
    hostingProvider: currentProject.infrastructure?.hostingProvider ?? '',
    hostingRegion: currentProject.infrastructure?.hostingRegion ?? '',
    databaseProvider: currentProject.infrastructure?.databaseProvider ?? '',
    storageProvider: currentProject.infrastructure?.storageProvider ?? '',
    emailProvider: currentProject.infrastructure?.emailProvider ?? '',
    sslProvider: currentProject.infrastructure?.sslProvider ?? '',
    infrastructureNotes: currentProject.infrastructure?.notes ?? ''
  };
  const next: Record<string, string> = {
    name, slug, clientId, description, purpose, vision, expectedOutcome,
    type, status, visibility, budget: budget?.toString() ?? '', currency,
    startedAt: startedAt?.toISOString().slice(0, 10) ?? '',
    expectedEndAt: expectedEndAt?.toISOString().slice(0, 10) ?? '',
    liveUrl: liveUrl ?? '', repositoryUrl: repositoryUrl ?? '',
    primaryDomain, domainRegistrar, dnsProvider, hostingProvider, hostingRegion,
    databaseProvider, storageProvider, emailProvider, sslProvider, infrastructureNotes
  };
  const changes = Object.keys(next)
    .filter(key => previous[key] !== next[key])
    .map(key => ({
      field: key,
      before: previous[key].slice(0, 240),
      after: next[key].slice(0, 240)
    }));

  await prisma.$transaction(async tx => {
    await tx.project.update({
      where: { id: projectId },
      data: {
        clientId: clientId || null,
        name, slug,
        description: description || null,
        purpose: purpose || null,
        vision: vision || null,
        expectedOutcome: expectedOutcome || null,
        type, status, visibility,
        // Progress is owned by milestone governance, never overwritten here.
        budget, currency, startedAt, expectedEndAt, completedAt
      }
    });

    if (liveUrl || repositoryUrl || currentProject.portfolio) {
      await tx.portfolioProfile.upsert({
        where: { projectId },
        create: { projectId, ...portfolioData },
        update: portfolioData
      });
    }
    if (Object.values(infrastructureData).some(Boolean) || currentProject.infrastructure) {
      await tx.projectInfrastructure.upsert({
        where: { projectId },
        create: { projectId, ...infrastructureData },
        update: infrastructureData
      });
    }
    if (changes.length) {
      await tx.projectActivity.create({
        data: {
          projectId,
          userId: actor.id,
          type: status !== currentProject.status ? 'STATUS_CHANGED' : 'UPDATED',
          title: status !== currentProject.status ? 'Project status changed' : 'Project settings updated',
          description: `${changes.length} project setting${changes.length === 1 ? '' : 's'} updated`,
          visibility: 'INTERNAL',
          metadata: { kind: 'PROJECT_MAINTENANCE_R3A', changes }
        }
      });
    }
  }, { maxWait: 10000, timeout: 20000 });

  revalidatePath(
    '/admin'
  );

  revalidatePath(
    '/admin/projects'
  );

  revalidatePath(
    `/admin/projects/${projectId}`
  );

  revalidatePath(
    `/admin/projects/${projectId}/edit`
  );

  revalidatePath(
    '/dashboard'
  );

  revalidatePath(
    '/dashboard/projects'
  );

  revalidatePath(
    `/dashboard/projects/${projectId}`
  );

  revalidatePath(
    '/portfolio'
  );

  revalidatePath(
    `/portfolio/${currentProject.slug}`
  );

  revalidatePath(
    `/portfolio/${slug}`
  );

  redirect(
    `/admin/projects/${projectId}`
  );
}