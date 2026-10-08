# Customer appearance settings

Four optional palettes: Yellow & Black, Emerald, Blue and Violet. Original neutral colours remain the default and can be restored.

Display mode is independent: Light, Dark or System. Existing explicit mode choices are preserved; System now follows live device changes. Header toggle uses the resolved mode, so it works correctly when System is selected.

Settings use native labelled radios with keyboard navigation and a responsive grid. The palette is restored before hydration. Choices persist per browser, propagate across tabs, and apply through shared design tokens to public and workspace pages. They are not account-synced across devices. Storage restrictions still permit selection for the current visit. Semantic success, warning and danger colours remain unchanged.

No database migration or environment variables required. Installer includes the preceding account-navbar and activity-panel releases when missing, requires the live messaging foundation, builds before pushing and recognises equivalent previously installed patches.
