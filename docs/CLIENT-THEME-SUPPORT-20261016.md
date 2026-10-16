# Client theme and support correction — 16 October 2026

Baseline: Systems `7c6720970b60433385d46cb3d01acd621efdac27`.

The apparent missing records were traced by the customer to testing an account without records. This update does not change data queries, ownership filters or saved records.

## Changes

- Replace muted text-colour fills with the established surface tokens on project cards, counter pills and hover states.
- Use accent border, text and faint background on Review brief / Add product brief and summary counters.
- Replace the small lifebuoy restore control and narrow collapsed toolbar with a labelled headset Support launcher. Both saved compact preferences remain compatible.
- Support ring, icon, focus outline and soft background follow the existing theme accent variables; no separate palette or simulated online indicator.
- Preserve pointer dragging, viewport bounds, keyboard movement, saved position, support details and live chat.

## Verification

Controlled component fixtures cover compact labels, tap/keyboard activation, arrow movement and drag without accidental expansion. Existing workspace/admin checks, TypeScript, changed-component ESLint and the production build are required. Desktop/mobile visual acceptance on the signed-in deployment remains required.

No data writes, migrations, uploads, commits or deployments are performed by installation or verification.
