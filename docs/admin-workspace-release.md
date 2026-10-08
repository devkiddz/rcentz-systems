# Restored Rcentz administration

The original admin pages from pending-routes/app/admin now run under /admin.
An ACTIVE ADMIN or SUPER_ADMIN is required in every page and existing write action.
Customer accounts cannot enter this surface. /adminlogin/login reuses /login with
an admin destination; signing in never grants a role.

Included: overview, submitted briefs and their private reference downloads,
project creation/editing and milestone management, invoice creation/editing and
existing invoice lifecycle actions, customer directory, tasks, finance,
notifications, appearance settings, and participant-scoped messaging.
The inbox reuses the customer's saved conversations and message APIs, including
support conversations assigned to this administrator. It does not expose other
administrators' private threads or create staff-to-staff customer support threads.

Brief review records an audit entry and notifies the customer. Creating a planning
project links it to the brief and customer, serializes duplicate conversions with
a PostgreSQL transaction lock, and notifies the customer. It does not record a
payment, agree a price or manufacture approval. Requested budgets are not copied
as agreed project budgets. Project type starts as OTHER and is editable.
Unsubmitted customer drafts remain excluded from this workflow and staff download.

The restored overview now renders saved records and zero/empty states, rather than
sample clients, payments, tasks or notifications. Existing deliberately seeded
Dennis demonstration records remain unchanged and must still be treated as demos.
Original overview project links now use IDs expected by the detail routes.
Unimplemented navigation destinations are removed for this initial release.
Customer support/mobile controls do not overlay admin; admin has its own shell.

Validation: ESLint, TypeScript and production build. scripts/check-admin-release.mjs
checks role authorization, guard placement, request conversion/review behavior and
file ownership using mocked dependencies. No production database writes were run.

After installing and Vercel finishes deployment:
1. Sign in with your existing ACTIVE admin account at /admin.
2. Inspect Dennis's saved project, its milestones, reviews and invoice records.
3. From the test customer, send a support message; from its assigned admin, reply
   at /admin/messages and verify the same conversation updates for the customer.
4. Submit a new test brief; start its review, inspect a reference upload, then create
   its planning project. Verify the customer sees the corresponding notification.
5. Confirm a customer cannot enter /admin or access another customer's reference.

No schema migrations, role changes, seeds, real payments, emails, dependencies or
environment changes are included. Existing production auth/database/blob settings
must remain configured. This restores the operational foundation; the private
opportunity finder, service catalogue administration, staff reassignment and deeper
admin analytics are separate follow-up work, not claimed implemented here.
