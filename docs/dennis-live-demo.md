# Dennis portfolio: live private demonstration

Target account: Dennis Jones / denngodfirst@gmail.com.
Target site: https://systems.rcentz.cc.
Live portfolio: https://dennis.rcentz.cc.

## Scope

Seven completed milestones cover discovery, visual design, profile and portfolio build,
contact/email workflow, Ask Denok, launch reviews, and handover/support.
The seed creates 21 completed tasks, seven features, seven accepted deliverables,
seven resolved review processes, seven sample approval versions, six milestone
dependencies, seven ready PDF records/files, 22 activities, seven updates,
14 project-conversation messages, one closed support example, an editable saved
onboarding brief and the real portfolio screenshot captured on 8 October 2026.

All historical dates, acceptance responses, support and conversation entries are
explicitly demonstration records. They are not proof that Dennis actually approved
or paid for a delivery. Project ownership is private. The PDFs and screenshot are
public sample assets and contain no credentials or private project documents.
No invoice, payment, subscription, email send or artificial analytics figures are created.

## Installation

Run the supplied PowerShell installer from the rcentz-systems repository.
It applies the Git bundle, installs the locked dependencies, lints, builds, checks
the database, pushes the release and waits for the exact preview/record assets to
appear on systems.rcentz.cc. It then asks privately for Dennis's password.
The password is never embedded in the package, written to disk or printed.

DATABASE_URL in the shell/.env.local must point to the same canonical PostgreSQL
database used by Vercel production. Shell variables take precedence over .env.local;
.env.local takes precedence over .env. The installer prints only the database hostname.
A local database is refused. Production also needs DATABASE_URL, BETTER_AUTH_SECRET
and BETTER_AUTH_URL=https://systems.rcentz.cc. No migrations, schema changes, reset,
SSL bypass or environment uploads are performed.

An active administrator and business-website-development service must already exist.
An existing email not owned by this seed causes a stop. Existing accounts, passwords,
roles and unrelated records are never overwritten. A repeat run of this seed leaves
its project, password and subsequent edits unchanged.

Creation is one transaction protected by a PostgreSQL advisory lock. If creation
fails, the account and dependent records roll back together. After commit, the
installer performs a live login and reads the dashboard project, overview,
onboarding, files and messages routes. It signs out its test session afterwards.
If post-commit verification fails, the records remain saved: inspect the stated
production issue and rerun; do not register another account or reset the database.

## Manual commands after installation

Read-only check:

    node --import tsx scripts/seed-dennis-live.ts --check

Wait for deployment assets:

    node scripts/wait-dennis-assets.mjs

Apply and verify:

    node --import tsx scripts/seed-dennis-live.ts --apply --live

## Validation performed before packaging

- Full current Prisma schema in a temporary PostgreSQL-compatible PGlite database.
- New credential account accepted by Better Auth's actual email/password sign-in.
- Milestone, dependency, feature, task, deliverable, process, record, approval,
  message and file counts checked.
- Existing-account refusal, password validation and transaction rollback checked.
- Rerun preserves the password and a simulated later project edit.
- Private ownership and no financial writes checked.
- PDF rendering inspected and source screenshot captured from the live portfolio.
- ESLint, TypeScript and production build passed.

Direct execution against the user's production database was not available in the
build workspace. The installer performs the production checks when run locally.
