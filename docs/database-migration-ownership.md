# Shared Database Migration Ownership

## Authority
Rcentz API is the sole Prisma migration authority for the shared Neon PostgreSQL database.

## Rcentz Systems
- May use Prisma Client to access the shared database.
- May maintain application-specific Prisma models.
- Must not independently execute Prisma migrations or `prisma db push`.
- Must not create migrations for the shared database.
- Must coordinate schema changes through Rcentz API.

## Database changes
1. Define the proposed schema change.
2. Implement and review it in rcentz-api.
3. Create and deploy the migration through rcentz-api.
4. Update dependent Prisma schemas and regenerate clients.
5. Validate dependent applications.

## Safety
Never reset the shared database to reconcile migration history.

The Systems migration directory is historical, not authoritative.
Database migration status must be checked through rcentz-api.
