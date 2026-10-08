'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { prisma } from '@/lib/prisma';

export async function reviewBrief(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get('requestId') || '');
  await prisma.$transaction(async tx => {
    const changed = await tx.serviceRequest.updateMany({ where: { id, status: 'PENDING' }, data: { status: 'REVIEWING' } });
    if (changed.count) {
      await tx.auditLog.create({ data: { userId: admin.id, action: 'BRIEF_REVIEW_STARTED', entityType: 'ServiceRequest', entityId: id } });
      const brief = await tx.serviceRequest.findUniqueOrThrow({ where: { id }, select: { userId: true, title: true } });
      await tx.notification.create({ data: { userId: brief.userId, type: 'SYSTEM', title: 'Your brief is being reviewed', message: brief.title, href: '/dashboard/onboarding/' + id } });
    }
  });
  revalidatePath('/admin'); revalidatePath('/admin/requests'); revalidatePath('/dashboard/requests');
}

export async function createPlanningProject(form: FormData) {
  const admin = await requireAdmin();
  const id = String(form.get('requestId') || '');
  const project = await prisma.$transaction(async tx => {
    // Serialize concurrent submissions so one brief creates only one project.
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"admin-brief:" + id}))`;
    const brief = await tx.serviceRequest.findUnique({ where: { id }, include: { project: { select: { id: true } } } });
    if (!brief || !['PENDING', 'REVIEWING', 'QUOTED', 'APPROVED', 'CONVERTED'].includes(brief.status)) throw new Error('This brief is not available for project planning.');
    if (brief.project) return brief.project;
    const project = await tx.project.create({ data: {
      clientId: brief.userId, serviceRequestId: brief.id, name: brief.title,
      slug: 'brief-' + brief.id, description: brief.description, type: 'OTHER', status: 'PLANNING', visibility: 'PRIVATE', currency: brief.currency,
      // Requested budgets are not agreed project budgets. Leave project budget unset.
    }, select: { id: true } });
    await tx.serviceRequest.update({ where: { id }, data: { status: 'CONVERTED' } });
    await tx.auditLog.create({ data: { userId: admin.id, action: 'BRIEF_PROJECT_CREATED', entityType: 'ServiceRequest', entityId: id, metadata: { projectId: project.id } } });
    await tx.notification.create({ data: { userId: brief.userId, type: 'PROJECT', title: 'Your project workspace is ready', message: brief.title + ' is now in planning. Scope and costs still need agreement.', href: '/dashboard/projects/' + project.id } });
    return project;
  });
  revalidatePath('/admin'); revalidatePath('/admin/requests'); revalidatePath('/admin/projects'); revalidatePath('/dashboard'); revalidatePath('/dashboard/projects'); revalidatePath('/dashboard/requests');
  redirect('/admin/projects/' + project.id);
}
