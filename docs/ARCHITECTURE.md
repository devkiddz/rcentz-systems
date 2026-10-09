# RCENTZ SYSTEM

# SYSTEM ARCHITECTURE

**Document:** System Architecture & Engineering Conventions  
**Version:** 1.3
**Status:** Active / Living Document  
**Last Updated:** 2026-10-09

## Current Systems boundaries — 9 October 2026

Use [SYSTEMS-STATUS.md](SYSTEMS-STATUS.md) for current implementation and verification. Older authentication-gap and progression notes below are inherited historical checkpoints, not the present release status.

The extracted Systems application serves public, account, customer dashboard and guarded admin routes. It uses server-side session/role/ownership checks before protected operations. Prisma records hold business state; requested budgets do not become agreed prices automatically. Public canvas tokens also size collapsed workspaces.

Project image uploads use the existing authenticated Cloudinary account. Browser cropping produces a bounded JPEG; the server still validates bytes and size. Staff-only replacement preserves record/order and changes the private delivery URL version. Deletion and replacement use project-scoped advisory locks and audits. Image delivery remains behind authenticated ownership checks. Provider cleanup is scoped to known project-owned IDs; failure after a committed change is recorded for follow-up. No migration is needed for this image release.

Read [project-image-editing.md](project-image-editing.md) for limits and verification. The job finder remains a planned private admin feature, governed by [admin-opportunity-finder-scope.md](admin-opportunity-finder-scope.md).


---

# 1. Purpose

This document defines the engineering architecture and structural conventions of the Rcentz System.

The documentation authorities are:

* `MASTER-BLUEPRINT.md` — product vision, system capabilities and long-term direction.
* `ARCHITECTURE.md` — engineering rules, code boundaries, data flow and structural conventions.
* `MILESTONES.md` — implementation progress, exit criteria, decisions and immediate next work.

The architecture exists to keep Rcentz understandable, maintainable, testable, reusable, scalable, auditable and consistent while supporting the current web application and future application surfaces.

---

# 2. Core Architectural Principle

Rcentz is a software system, not a collection of pages.

Preferred flow:

```text
USER
 ↓
APPLICATION SURFACE
 ↓
FEATURE / ENGINE
 ↓
BUSINESS LOGIC
 ↓
DATA ACCESS
 ↓
DATABASE / PROVIDER
```

Avoid:

```text
PAGE
 ↓
Random database query
 ↓
Business rules
 ↓
Duplicated logic
```

UI components must not become the primary home of business rules.

---

# 3. Source of Truth

PostgreSQL + Prisma form the primary persistent business-data foundation.

```text
                    DATABASE
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       PUBLIC        CLIENT        ADMIN
          │            │            │
          └────────────┼────────────┘
                       ↓
                 FUTURE APPS
```

Business data shared across surfaces should have one canonical source. Static configuration may remain in code where appropriate.

External services may supplement Rcentz, but they do not automatically become the owner of Rcentz business data or presentation.

---

# 4. Application Surfaces

Rcentz contains distinct application surfaces:

```text
RCENTZ SYSTEM
│
├── Public Web
├── Authentication
├── Client Application
├── Admin Application
└── Future Applications
```

Each surface may use a different shell and interaction density while consuming shared business capabilities and persistent data.

---

# 5. Current Technology Baseline

As of 2026-08-31, the repository foundation uses:

```text
Next.js 16.3.3
React 19.2.8
TypeScript 5
Tailwind CSS 4
pnpm 11.1.1
Prisma 7.10.0
PostgreSQL / Neon
Better Auth 1.7.2
```

This section records the current engineering baseline; version changes should be reflected here when they materially affect architectural conventions.

---

# 6. Next.js Version-Sensitivity Rule

The installed Next.js version may contain breaking changes relative to older framework knowledge.

Before writing framework-sensitive code, verify the relevant conventions against the installed Next.js documentation and repository agent guidance.

Do not assume older App Router examples remain correct merely because they compile conceptually.

---

# 7. Progressive Application Structure

The target responsibility map is:

```text
app/
features/
components/
lib/
server/
data/
prisma/
public/
docs/
```

This is a **responsibility model**, not a requirement to create empty folders.

Current repository implementation already contains meaningful `app/`, `lib/`, `prisma/` and `docs/` boundaries. `features/`, `components/` and `server/` should be created when real implementation requires those responsibilities.

The rule is:

> Create a boundary because code needs a clear home, not because a diagram contains the folder name.

---

# 8. `app/`

`app/` is primarily responsible for Next.js routing and application surfaces.

It may contain:

* Routes
* Layouts
* Pages
* Loading states
* Error boundaries
* Route handlers
* Route-specific composition

`app/` should not become the dumping ground for reusable business logic.

```text
app/
 ↓
ROUTING + APPLICATION SURFACE
```

---

# 9. `features/`

`features/` contains reusable business-oriented feature modules when those modules become necessary.

Examples:

```text
features/
├── auth/
├── projects/
├── portfolio/
├── services/
├── commerce/
├── blog/
├── messaging/
├── notifications/
├── analytics/
└── support/
```

A feature may own feature components, hooks, types, client interactions, presentation logic and feature-specific utilities.

A feature should represent a meaningful business capability, not an arbitrary collection of files.

---

# 10. `components/`

`components/` contains reusable UI that is not exclusively owned by one business feature.

Potential structure:

```text
components/
├── ui/
├── layout/
├── navigation/
├── forms/
└── shared/
```

Feature-specific UI should generally remain with its feature.

Shared components should be reusable because their responsibility is genuinely shared, not because they were moved prematurely.

---

# 11. `lib/`

`lib/` contains shared application infrastructure and integrations.

Current examples:

```text
lib/
├── auth.ts
├── auth-client.ts
└── prisma.ts
```

Appropriate responsibilities include:

* Authentication configuration
* Database client infrastructure
* External service clients
* Shared integration utilities

Business-domain logic should not automatically be placed in `lib/`.

---

# 12. `server/`

`server/` is the intended home for backend-oriented business/data logic when complexity justifies separation from route and UI composition.

Potential structure:

```text
server/
├── services/
├── repositories/
├── actions/
├── validators/
└── authorization/
```

It may contain:

* Database operations
* Domain services
* Business rules
* Server actions
* Runtime validation
* Authorization checks
* Provider orchestration

The directory should be introduced when real server-domain code requires it.

---

# 13. Services

A service represents a focused business responsibility.

Examples:

```text
ProjectService
AuthService
PaymentService
NotificationService
PortfolioService
OrderService
```

Prefer small, explicit responsibilities over giant universal service files.

```text
Small responsibility
        ↓
Clear interface
        ↓
Reusable capability
```

---

# 14. Repositories / Data Access

Data access should be separated from presentation when complexity justifies it.

```text
UI / APPLICATION
       ↓
ENGINE / SERVICE
       ↓
REPOSITORY / DATA ACCESS
       ↓
PRISMA
       ↓
POSTGRESQL
```

A repository persists and retrieves domain data. It does not decide how that data is visually rendered.

Do not add a repository layer mechanically for trivial queries; introduce it when it clarifies ownership, reuse, testing or business boundaries.

---

# 15. Server Actions vs Route Handlers

Use the server mechanism that matches the responsibility.

## Server Actions

Prefer Server Actions for internal application mutations such as:

* Create/update a project
* Update a profile
* Submit a service request
* Change project state
* Internal authenticated forms

```text
USER / FORM
 ↓
SERVER ACTION
 ↓
AUTHORIZATION + VALIDATION
 ↓
BUSINESS LOGIC
 ↓
DATABASE
```

## Route Handlers

Prefer Route Handlers when an HTTP endpoint itself is required, such as:

* Authentication endpoints
* Webhooks
* External API endpoints
* Provider callbacks
* Public integrations

```text
HTTP REQUEST
 ↓
ROUTE HANDLER
 ↓
VALIDATION / AUTHORIZATION
 ↓
BUSINESS LOGIC
 ↓
DATABASE / PROVIDER
```

---

# 16. Authentication Architecture

Authentication is shared infrastructure.

Current foundation:

```text
Next.js
   ↓
Better Auth
   ↓
Prisma Adapter
   ↓
Prisma Client
   ↓
PostgreSQL / Neon
```

Authentication and authorization are related but distinct:

* Authentication: Who is the user?
* Authorization: What may the user do?

---

# 17. Current Authentication Implementation

The repository currently exposes Better Auth through:

```text
app/api/auth/[...all]/route.ts
```

A session inspection route currently exists at:

```text
app/api/auth/session/route.ts
```

Shared authentication/database infrastructure currently lives at:

```text
lib/auth.ts
lib/auth-client.ts
lib/prisma.ts
```

Validated foundation:

* Registration
* Login
* Session retrieval
* Prisma persistence
* TypeScript compilation

This means the authentication **foundation is working**, not that the entire authentication milestone is production-complete.

---

# 18. Known Authentication Production Gap

`lib/auth-client.ts` currently uses a localhost development base URL.

That is acceptable only as temporary local configuration.

Before deployment, authentication client configuration must become environment/deployment-safe and be verified across development and production origins.

Do not describe authentication as production-ready until this and the remaining authorization/protected-surface work are complete.

---

# 19. Authentication UI Boundary

Authentication is a separate application experience and should not render the global public Navbar.

```text
PUBLIC
└── Public Shell
    ├── Navigation
    ├── Page
    └── Footer

AUTH
└── Auth Shell
    ├── Branding
    └── Authentication Interface

CLIENT
└── Client Application Shell

ADMIN
└── Admin Application Shell
```

This boundary keeps authentication focused and prevents accidental coupling to the marketing/public shell.

---

# 20. Client Authentication Progression

The next authentication implementation sequence is:

```text
Auth Client
   ↓
Session State
   ↓
Auth Shell
   ↓
Register UI
   ↓
Login UI
   ↓
Logout
   ↓
Auth-Aware Navigation
   ↓
Protected Application Surface
   ↓
Role-Aware Authorization
```

Each step should be implemented and audited as the smallest meaningful module/file.

---

# 21. Authorization

Rcentz roles currently include:

```text
USER
CLIENT
STAFF
ADMIN
SUPER_ADMIN
```

Role values in the database do **not** by themselves create authorization.

Authorization must be enforced at trusted server/business boundaries. Hiding a button or route link in the UI is not sufficient protection.

---

# 22. Security Boundary

Security-sensitive rules belong on trusted server-side boundaries.

Examples:

* Permission checks
* Ownership validation
* Administrative mutations
* Project access
* Payment validation
* Order operations
* File validation
* Sensitive account changes

The browser may express intent; the server remains authoritative.

---

# 23. Validation

TypeScript types are not runtime validation.

Important external or user input should pass through runtime validation before business logic and persistence.

```text
INPUT
 ↓
VALIDATION
 ↓
AUTHENTICATION / AUTHORIZATION
 ↓
BUSINESS LOGIC
 ↓
DATABASE / PROVIDER
```

Types provide developer guarantees. Runtime validation provides application guarantees. Both matter.

---

# 24. Error Handling

Errors should be translated intentionally across layers.

```text
DATABASE / PROVIDER ERROR
          ↓
BUSINESS / DOMAIN ERROR
          ↓
APPLICATION ERROR
          ↓
SAFE USER-FACING ERROR
```

Errors should be meaningful, actionable, logged where appropriate and safe for their intended audience.

Internal implementation detail should not leak unnecessarily to public clients.

---


# 25. Canonical Project Boundary

Rcentz must not maintain separate competing project records for internal project management and public portfolio presentation.

The canonical relationship is:

```text
Project
  │
  ├── Internal project management
  ├── Client-visible project tracking
  ├── Public project updates
  ├── Analytics
  ├── Media / technologies / SEO
  │
  └── PortfolioProfile?
          ↓
     Public presentation
```

`Project` owns the project identity and operational truth.

`PortfolioProfile` is optional and contains public presentation fields that only make sense when a project is being showcased.

This allows a project such as AJ Logik to exist once while different application surfaces consume only the information they are authorized to display.

The same principle applies to project updates through visibility levels:

```text
INTERNAL
CLIENT
PUBLIC
```

A public portfolio must not become a manually synchronized copy of project-management data.

---

# 27. Engine Architecture

Rcentz follows the principle:

> **Everything is an Engine.**

Examples:

```text
Authentication Engine
Project Management Engine
Portfolio Engine
Services Engine
Commerce Engine
Content Engine
Messaging Engine
Notification Engine
Analytics Engine
Media Engine
SEO Engine
```

An engine represents a meaningful capability. Pages primarily compose and expose engines.

An engine is not automatically one giant file; it is the cohesive capability formed by its appropriate UI, business, server and data boundaries.

---

# 27. Provider Architecture

Where useful, engines should depend on provider abstractions rather than hardwiring presentation to infrastructure.

```text
PROVIDER
   ↓
BUSINESS / DATA LAYER
   ↓
ENGINE
   ↓
APPLICATION SURFACE
   ↓
UI
```

Potential providers include payments, storage, email, analytics, authentication and search.

Do not create abstractions before a real boundary or substitution need exists.

---

# 28. External Integrations

External systems may include:

```text
GitHub
Vercel
Paystack
Cloud Storage
Analytics Providers
OAuth Providers
```

They are integrations unless explicitly designed as a source of truth.

Rcentz retains canonical ownership of business information and portfolio presentation that belongs to Rcentz.

---

# 29. UI Design Philosophy

Rcentz maintains its own visual identity while learning from high-quality software products.

```text
Vercel
   +
Prisma
   +
Linear
   ↓
RCENTZ
```

This is inspiration, not cloning.

## Public Website

Vercel-inspired: minimal, spacious, strong typography and professional marketing/discovery.

## Authentication

Minimal Vercel-inspired: focused authentication with limited distraction.

## Client Application

Vercel + Linear-inspired: clear productivity workflows and readable information density.

## Admin / Engineering

Prisma + Linear-inspired: structured, data-rich management interfaces.

---

# 30. Design Tokens

Components should consume semantic design tokens rather than hardcoded colors.

Examples:

```text
background
foreground
muted
border
primary
secondary
destructive
accent
```

The system should support light/dark compatibility, a black-and-white default direction and later user-selectable theme accents without rewriting individual components.

---

# 31. Responsive & Adaptive Experience Architecture

Desktop and mobile are the same Rcentz system, but they are not required to use the same page composition.

The architectural principle is:

```text
                     SAME SYSTEM
                         │
                 SAME CANONICAL DATA
                         │
                 SAME BUSINESS LOGIC
                         │
                   SAME ROUTE / URL
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
      DESKTOP EXPERIENCE      MOBILE EXPERIENCE
              │                     │
      Higher information      Focused information
      density                 density

      Large workspace         App-like interaction

      Rich navigation         Compact navigation

      Editorial layouts       Activity-driven layouts

      Hover/contextual        Touch-first actions
      interactions

      Wide visual systems     Cards, rails, sheets,
                              quick actions
```

Rcentz therefore supports **adaptive presentation composition**, not merely responsive shrinking.

A page may expose dedicated desktop and mobile presentation components when the experience materially benefits from doing so.

For example:

```text
Home
 │
 ├── HomeDesktop
 │
 └── HomeMobile
```

Both presentations must consume the same canonical application data and business capabilities.

```text
                  HOME DATA / ENGINE
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
         HomeDesktop            HomeMobile
```

This must not become:

```text
desktop database      ❌
mobile database       ❌
desktop business logic ❌
mobile business logic  ❌
duplicated routes      ❌
```

The preferred model is:

```text
ONE SYSTEM
ONE DATA SOURCE
ONE BUSINESS ENGINE
ONE CANONICAL URL
MULTIPLE PURPOSE-BUILT EXPERIENCES
```

The shared Rcentz UI Shell remains responsible for the persistent visual environment and structural identity across these experiences.

The shell may provide:

* Controlled centered canvas/container behavior
* Structural grid
* Ambient data points and visual signals
* Shared spacing and layout boundaries
* Application-wide visual identity
* Responsive environmental behavior

Individual application surfaces may then compose their content differently for desktop, tablet and mobile without duplicating domain logic.

The mobile experience should be designed intentionally as a professional application surface rather than treated as a compressed desktop page.

This principle applies across:

* Public website
* Project portfolio
* Services
* Commerce
* Client workspace
* Authentication
* Admin interfaces
* Future Rcentz applications

The same architecture may also support Rcentz client work where an existing website requires a substantially improved mobile-specific experience.

Very wide desktop screens should remain controlled through the bounded Rcentz canvas rather than stretching content indefinitely.

---

# 32. Component Responsibility

A component should have a clear reason to exist.

Prefer explicit names such as:

```text
ProjectCard
ProjectDashboard
ProjectDetails
```

Avoid generic multi-purpose components with dozens of unrelated branches.

Complex business rules belong in the appropriate feature/server/business layer.

---

# 33. Naming Conventions

Names should communicate responsibility.

Prefer:

```text
ProjectService
ProjectRepository
ProjectCard
ProjectActions
```

Avoid vague names such as:

```text
Stuff
Helpers2
Thing
Misc
```

Use `utils` or `helpers` only when the responsibility is genuinely broad, obvious and still cohesive.

---

# 34. State Management

State should live at the narrowest reasonable scope.

```text
Local UI state
    ↓
Feature state
    ↓
Application state
    ↓
Server/database state
```

Do not introduce global state merely because two components share a value.

Persistent business data remains authoritative on the server/database.

---

# 35. Data Flow

Preferred read flow:

```text
DATABASE
   ↓
DATA ACCESS
   ↓
BUSINESS LOGIC
   ↓
ENGINE / FEATURE
   ↓
APPLICATION SURFACE
   ↓
UI
```

Preferred mutation flow:

```text
USER ACTION
   ↓
SERVER ACTION / ROUTE
   ↓
VALIDATION
   ↓
AUTHORIZATION
   ↓
BUSINESS LOGIC
   ↓
DATA ACCESS
   ↓
DATABASE
   ↓
UPDATED UI
```

---

# 36. Caching & Revalidation

Caching should follow data behavior and security requirements.

```text
STATIC DATA        → long-lived where safe
PUBLIC CONTENT     → revalidated where useful
USER-SPECIFIC DATA → request/session-aware
REAL-TIME DATA     → dynamic communication when justified
```

Caching must never expose another user's data or compromise authorization correctness.

---

# 37. Database Changes

Database changes follow a controlled workflow:

```text
CHANGE SCHEMA
      ↓
FORMAT
      ↓
VALIDATE
      ↓
CREATE MIGRATION
      ↓
APPLY MIGRATION
      ↓
GENERATE CLIENT
      ↓
TYPECHECK
      ↓
TEST
      ↓
COMMIT
```

The repository already contains migration history. Future structural changes must continue through migrations rather than manual production database edits.

---

# 38. Current Database Foundation

The Prisma schema already establishes broad foundational domains including identity, clients/staff, projects, services, commerce, content/community, messaging/support, notifications, analytics, media and SEO-related structures.

This is a **foundation**, not a declaration that every domain model is final.

Rules:

* Refine a domain when its engine is implemented.
* Preserve migration discipline.
* Avoid speculative schema churn without a real product requirement.
* Keep shared business information database-driven.
* Add seed strategy and business seed data deliberately.

---

# 39. Development Workflow

Rcentz development follows:

```text
PLAN
  ↓
ARCHITECT
  ↓
ONE FILE / MODULE
  ↓
AUDIT
  ↓
ASK WHY / SUGGEST
  ↓
DISCUSS / MODIFY
  ↓
IMPLEMENT
  ↓
TEST
  ↓
DOCUMENT
  ↓
COMMIT
  ↓
PUSH
  ↓
NEXT MODULE
```

AI assistance may prepare proposed files/code, but the developer remains responsible for local implementation, inspection, testing and acceptance before commit.

Speed must not remove auditability or understanding.

---

# 40. Git Discipline

Before a meaningful commit:

```text
git status
typecheck
lint
tests where applicable
```

Use meaningful conventional-style commit messages such as:

```text
feat(auth): establish authentication foundation
feat(projects): add project management engine
fix(auth): resolve session handling issue
refactor(server): separate project data access
docs(architecture): update system boundaries
```

The repository should remain a trustworthy representation of the implemented system.

---

# 41. Documentation Discipline

The current documentation hierarchy is:

```text
MASTER-BLUEPRINT.md
        ↓
PRODUCT VISION + SYSTEM DIRECTION
        ↓
ARCHITECTURE.md
        ↓
ENGINEERING RULES + RESPONSIBILITY BOUNDARIES
        ↓
MILESTONES.md
        ↓
IMPLEMENTATION STATE + NEXT WORK
        ↓
ACTUAL CODEBASE
```

When documentation disagrees with verified code behavior, update the documentation. Do not keep stale progress text merely to preserve an old plan.

---

# 42. Modular Monolith / Microservices Philosophy

Rcentz should not prematurely become a collection of microservices.

```text
MODULAR MONOLITH
      ↓
Clear domains
      ↓
Clear services
      ↓
Clear data access
      ↓
Clear interfaces
      ↓
Extract only when justified
```

Extraction is justified by real deployment, scaling, ownership or isolation requirements — not by the desire to appear architecturally sophisticated.

---

# 42. Future Application Readiness

Critical business rules should not exist exclusively inside Next.js UI components.

```text
                 RCENTZ BUSINESS LAYER
                         │
             ┌───────────┴───────────┐
             ↓                       ↓
            WEB                    MOBILE
             │                       │
       Web Interface          Native Interface
```

The objective is not to build a separate mobile backend today. The objective is to preserve clean domain and server boundaries so future application surfaces can reuse the same rules and data.

---

# 43. Architecture Decision Rule

When deciding where new code belongs, ask:

1. Is it routing or an application surface? → `app/`
2. Is it reusable business functionality or feature-owned presentation? → `features/`
3. Is it genuinely shared UI? → `components/`
4. Is it shared infrastructure/integration? → `lib/`
5. Is it server-side business/data logic? → `server/`
6. Is it persistent business data? → Prisma/PostgreSQL
7. Is it static configuration? → the appropriate configuration/data location

If a target directory does not yet exist, create it when this responsibility first becomes real.

The goal is not folder worship. The goal is clear responsibility.

---

# 44. Definition of Architecture-Ready Work

A meaningful implementation unit should normally be considered ready to move forward only when applicable checks have been considered:

* Responsibility is clear.
* TypeScript passes.
* Runtime behavior is tested.
* Validation exists where input crosses a trust boundary.
* Authorization is enforced where protected data/actions are involved.
* Responsive behavior is tested for UI work.
* Database migration behavior is reviewed for schema work.
* Error behavior is considered.
* Documentation is updated when the system state changed.
* Git changes are reviewable and intentional.

A working demo is not automatically a production-ready feature.

---

# 45. Current Engineering Focus

The next feature is the private automatic job finder. Implement the Jobs & Contracts lane first, after the current image-management release is installed and its real browser/provider checks pass. Preserve owner-specific permissions, supported-source contracts, honest match explanations and review before outreach.

See [SYSTEMS-STATUS.md](SYSTEMS-STATUS.md) for current release evidence and [admin-opportunity-finder-scope.md](admin-opportunity-finder-scope.md) for agreed scope. Do not treat source implementation or build success as proof of a live provider integration.

---

# 46. Final Architecture Principle

Rcentz should remain understandable as it grows.

A developer should be able to answer:

```text
Where does this route live?
Where does this feature live?
Where does this business rule live?
Where does this database operation live?
Where does authorization happen?
Where does this provider integration live?
Where does reusable UI live?
Where is the source of truth?
```

If those questions become difficult to answer, the architecture needs attention.

> **Make complexity visible, structured and intentional.**

Rcentz should become sophisticated without becoming chaotic.

---

# END OF SYSTEM ARCHITECTURE
