'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/features/auth/server/require-admin';
import { prisma } from '@/lib/prisma';
import { PROJECT_DELETION_MARKER } from '@/features/projects/lib/deletion';

async function decide(form: FormData, approve: boolean) {
  const admin = await requireAdmin();
  const id = String(form.get('requestId') || '');
  const note = String(form.get('note') || '').trim();
  if (!id || id.length > 128) throw new Error('Invalid deletion request.');
  if (approve && form.get('confirm') !== 'APPROVE') {
    throw new Error('Confirm the archival decision before proceeding.');
  }
  if (!approve && (note.length < 10 || note.length > 1000)) {
    throw new Error('Provide a decision reason between 10 and 1,000 characters.');
  }
  if (note.length > 1000) throw new Error('Decision note is too long.');

  const projectId = await prisma.$transaction(async tx => {
    const initial = await tx.projectProcess.findFirst({
      where: { id, type: 'OTHER', impact: PROJECT_DELETION_MARKER },
      select: { projectId: true }
    });
    if (!initial) throw new Error('Deletion request not found.');
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'project-deletion:' + initial.projectId}))`;
    const pending = await tx.projectProcess.findFirst({
      where: { id, type: 'OTHER', impact: PROJECT_DELETION_MARKER, status: 'PENDING' },
      include: { project: { select: { id: true, name: true, clientId: true, status: true } } }
    });
    if (!pending) throw new Error('This request has already been decided. Refresh the page.');
    if (!pending.project.clientId) throw new Error('This project does not have a customer account.');

    const updated = await tx.projectProcess.updateMany({
      where: { id, status: 'PENDING', type: 'OTHER', impact: PROJECT_DELETION_MARKER },
      data: {
        status: approve ? 'RESOLVED' : 'CANCELLED',
        resolvedAt: new Date(),
        resolutionNotes: approve ? (note || 'Approved by a Rcentz administrator; project archived.') : note
      }
    });
    if (updated.count !== 1) throw new Error('The request has changed. Refresh and try again.');

    if (approve) {
      // Archive, do NOT cascade-delete financial, milestone, file, or audit records.
      await tx.project.update({ where: { id: initial.projectId }, data: { status: 'CANCELLED' } });
      await tx.projectActivity.create({
        data: { projectId: initial.projectId, userId: admin.id, type: 'STATUS_CHANGED',
          visibility: 'INTERNAL', title: 'Customer deletion request approved',
          description: 'Project archived from the client workspace.',
          metadata: { requestId: id } }
      });
    }

    await tx.auditLog.create({
      data: { userId: admin.id,
        action: approve ? 'PROJECT_DELETION_APPROVED' : 'PROJECT_DELETION_REJECTED',
        entityType: 'Project', entityId: initial.projectId,
        metadata: { requestId: id, decisionNote: note } }
    });
    await tx.notification.create({
      data: { userId: pending.project.clientId,
        type: 'PROJECT',
        title: approve ? 'Your project deletion request was approved' : 'Your project deletion request was declined',
        message: approve
          ? `${pending.project.name} has been archived from your project workspace. Records are retained according to Rcentz policy.`
          : `${pending.project.name}: ${note}`,
        href: approve ? '/dashboard/projects' : `/dashboard/projects/${initial.projectId}`,
        entityType: 'Project', entityId: initial.projectId }
    });
    return initial.projectId;
  });

  revalidatePath('/admin/projects/deletion-requests');
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath('/admin/projects');
  revalidatePath('/dashboard/projects');
  revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath('/dashboard');
  redirect('/admin/projects/deletion-requests');
}

export async function approveProjectDeletion(form: FormData) {
  await decide(form, true);
}

export async function rejectProjectDeletion(form: FormData) {
  await decide(form, false);
}
