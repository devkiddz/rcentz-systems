// Stable discriminator stored in ProjectProcess. No Prisma migration required.
export const PROJECT_DELETION_MARKER = 'RCENTZ_PROJECT_DELETION_REQUEST_V1';

export const PROJECT_DELETION_TITLE = 'Customer project deletion request';

export function formatProjectDeletionStatus(status: string) {
  if (status === 'PENDING' || status === 'IN_PROGRESS') return 'Pending admin review';
  if (status === 'RESOLVED') return 'Approved and archived';
  if (status === 'CANCELLED') return 'Declined';
  return status;
}
