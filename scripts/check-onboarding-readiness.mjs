// Read-only deployment preflight. Never prints connection strings or secrets.
import path from 'node:path';
import dotenv from 'dotenv';
import { Pool } from 'pg';
const projectRoot = process.cwd();
// Shell variables take precedence; .env.local takes precedence over .env.
dotenv.config({
  path: [path.join(projectRoot, '.env.local'), path.join(projectRoot, '.env')],
  quiet: true
});

async function check() {
  const missing = [
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL'
  ].filter((key) => !process.env[key]);
  if (missing.length)
    throw new Error(
      'Configure these variables before pushing onboarding: ' +
        missing.join(', ')
    );
  if (process.env.BETTER_AUTH_SECRET.length < 32)
    throw new Error(
      'BETTER_AUTH_SECRET must contain at least 32 characters. Use a strong randomly generated secret.'
    );
  const base = new URL(process.env.BETTER_AUTH_URL);
  if (
    !['http:', 'https:'].includes(base.protocol) ||
    base.username ||
    base.password
  )
    throw new Error('BETTER_AUTH_URL must be your application origin.');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
    max: 1
  });
  try {
    await pool.query('SELECT id, role, status FROM "user" LIMIT 0');
    await pool.query('SELECT id, "userId", token FROM "session" LIMIT 0');
    await pool.query('SELECT id, "userId", password FROM "account" LIMIT 0');
    await pool.query(
      'SELECT id, "userId", "serviceId", budget, currency, "submittedAt", "onboardingCompletedAt" FROM "ServiceRequest" LIMIT 0'
    );
    // Dashboard tables must already exist in the canonical API database.
    for (const table of [
      'ServiceOnboardingQuestion',
      'ServiceRequestAnswer',
      'Project',
      'ProjectInfrastructure',
      'ProjectMilestone',
      'ProjectMilestoneRecord',
      'ProjectProcess',
      'ProjectFeature',
      'ProjectFile',
      'MediaAsset',
      'ProjectAnalyticsConfig',
      'ProjectAnalyticsDaily',
      'ProjectAnalyticsGoal',
      'Invoice',
      'Payment',
      'ClientSubscription',
      'SupportTicket',
      'Notification',
      'Conversation',
      'ConversationParticipant',
      'Message',
      'Product',
      'Order',
      'DigitalDelivery'
    ]) {
      await pool.query(`SELECT id FROM "${table}" LIMIT 0`);
    }
    const slugs = [
      'business-website-development',
      'custom-web-application-development',
      'ecommerce-store-development',
      'mobile-application-development',
      'internal-operations-system'
    ];
    const { rows } = await pool.query(
      'SELECT slug FROM "Service" WHERE status = $1 AND slug = ANY($2::text[])',
      ['ACTIVE', slugs]
    );
    const unavailable = slugs.filter(
      (slug) => !rows.some((row) => row.slug === slug)
    );
    if (unavailable.length)
      throw new Error(
        'Activate these existing catalogue services before pushing: ' +
          unavailable.join(', ')
      );
    console.log(
      'Local account configuration, dashboard tables and service catalogue passed read-only checks.'
    );
    console.log(
      'Also configure DATABASE_URL, BETTER_AUTH_SECRET and BETTER_AUTH_URL on your host. Production BETTER_AUTH_URL must match the public site origin.'
    );
  } finally {
    await pool.end();
  }
}
check().catch((error) => {
  if (
    error.message.startsWith('Configure ') ||
    error.message.startsWith('BETTER_AUTH_') ||
    error.message.startsWith('Activate ')
  )
    console.error(error.message);
  else
    console.error(
      'Database readiness check failed. Verify the connection, permissions and existing Prisma tables. No database changes were made.'
    );
  process.exitCode = 1;
});
