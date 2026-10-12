# Soft-touch console design system

The running handbook uses the approved `design/soft-touch-console/tokens.json` as its single palette/material source. `npm run design:tokens` generates `tokens.css`; production builds run it automatically. Generated CSS should not be edited by hand.

## Ownership and composition

- `system.css`: semantic aliases (`--surface`, `--accent`, etc.) and recipe import order.
- `materials.css`: four reusable material primitives: `material-panel`, `material-elevated`, `material-inset`, `material-toolbar`.
- `Button.tsx` / `controls.css`: shared native button behavior and control recipes. Existing semantic primary/secondary/icon classes retain their layout. New controls can set `material="raised"` or `material="ghost"` explicitly. Ref, accessible names, native disabled state and event handlers pass through.
- `components.css`: domain recipes, two-category schedule signals, reading surfaces, shell composition and responsive typography.
- `src/index.css`: existing layout in the `legacy` cascade layer; material recipes deliberately live outside it. Do not add new appearance overrides at the end of this file.
- `src/motion.css`: shared timing, presence and reduced-motion behavior. Dense time marks and full-row targets do not physically shift when pressed.

Apply a material class to a semantic container rather than wrapping it in a decorative card. For example, the shared `SchedulePanel` composes a panel shell, toolbar header and inset canvas; `FilterSelect` composes a raised Button with an elevated popover; all three detail types use the same elevated dialog and inset practical-facts block.

## State rules

Primary actions use sage; activities use orange; courses use teal. Selected navigation stays black with light text. Saved state retains its bookmark and label, visited state its check. Selection is not communicated only through color. Raised controls have default/hover/pressed/focus/disabled treatments; current date and segmented keys share an inset track. Reading backgrounds have no gradients or texture. Shadows never own chapter separators.

## Verification

Browser checks cover 320, 390, 768 and 1440px: overview, list/panorama, exhibitors, personal guide, map, visitor guide and search have no page overflow. Detail panes retain source filters; mobile dialogs, header menu, grouped filtering, fullscreen nesting and Escape ordering work. Tokens and semantic foreground pairs are contrast checked. Build and lint must pass after changes.
