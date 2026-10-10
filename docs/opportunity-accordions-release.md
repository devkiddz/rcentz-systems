# Hunt configuration accordions

Systems-only UI release. No API change, migration or retention enablement change.

Five separated sections: career direction (initially open), project references, work boundaries/discovery, storage/cleanup and schedule/delivery. Native keyboard-accessible summaries keep form fields mounted when collapsed. Invalid fields open their enclosing section. Cleanup preview opens storage automatically. The profile save control remains inside its form, with a sticky bar and existing loading state. Existing project entries and server-side preservation remain unchanged.

Install and verify, run Checkpoint-Accordions.ps1 -Preview, then Checkpoint-Accordions.ps1. Deploy Systems only with vercel --prod. Confirm saved profile values after refresh, desktop/mobile spacing, keyboard toggles and cleanup preview.
