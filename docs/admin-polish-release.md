# Admin presentation and onboarding preview

Project detail now offers Preview onboarding when it has a submitted linked brief.
/admin/projects/[projectId]/onboarding is a guarded overview of that original brief.
The submitted request page uses the same overview: goals/features, audience,
business context, requested budget, timing, notes, support preference and private
references. Image references have authenticated previews; documents have downloads.
No private file storage paths are sent to client components or made public.
Projects without a linked submitted brief do not display a misleading preview.

Long onboarding text no longer dominates a linked project's header. That header
stays focused on delivery; the full brief is available through its preview button.
Existing review and planning actions remain unchanged. Reading a preview never
creates a project, sends a message, agrees a budget or modifies customer data.

Admin typography uses consistent readable sizes, card radii and spacing. Sidebar
uses the existing official C symbol plus the approved rcentz wordmark. Explicit
SVG sizing prevents sidebar icon rules from shrinking the wordmark. Sidebar and
navigation header borders are aligned at 64px. The expanded command-search input
appears on wide desktops; its existing compact trigger remains on smaller screens.
Mobile navigation labels Home and Briefs avoid truncation in narrow cells.

Verified preview/shell using local fixtures at 390, 768 and 1440px, light/dark;
no horizontal overflow or browser page errors; sidebar/header border alignment and
wordmark sizing checked. The fixture route is removed from the package.
ESLint, production build and existing mocked admin access checks also run.
No production database writes, migrations, fonts, role changes or seeding included.
