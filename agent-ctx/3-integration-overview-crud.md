# Task 3 — Integration Overview CRUD Dialogs

## Agent: Frontend Developer

## What was done

Rewrote `/home/z/my-project/src/components/admin/integrations/integration-overview.tsx` to add full **Add**, **Edit**, and **Delete** CRUD functionality with dialog UI.

### Changes Made

1. **New `ConnectorFormDialog` component** — A shared dialog for Add and Edit modes:
   - ERP Name (text input)
   - ERP Slug (text input, auto-generated from name via `slugify()` in Add mode)
   - Type (Select: database, api, webhook — with colored icons)
   - Direction (Select: bidirectional, inbound, outbound — with colored icons)
   - Auto-Sync (Switch toggle with description)
   - Sync Interval (Select: 60s to 86400s with human-readable labels, shown only when auto-sync is on)
   - Validation: name & slug must be ≥2 chars
   - Loading state with spinner on submit button
   - Cancel + Submit buttons in footer

2. **New `DeleteConfirmDialog` component** — AlertDialog with:
   - Warning message naming the connector
   - Red destructive-styled Delete button with Trash2 icon
   - Cancel button
   - Loading state during deletion

3. **Add Connector button** — Added in the actions bar next to Auto-Discover (Plus icon, primary style)

4. **Edit button** — Added to each ConnectorCard's action row (Pencil icon, ghost style)
   - Opens `ConnectorFormDialog` in edit mode pre-filled with connector data
   - Calls PATCH `/api/admin/integrations` with the connector's `id`

5. **Delete button** — Added to each ConnectorCard's action row (Trash2 icon, red ghost style)
   - Opens `DeleteConfirmDialog` for confirmation
   - Calls DELETE `/api/admin/integrations` with `{ id }`

### Preserved
- All existing functionality: SummaryBar, SkeletonGrid, EmptyState, Auto-Discover, Test, Configure, auto-sync toggle
- All existing types: `ConnectorData`, `directionConfig`
- All existing imports: `getErpIcon`, `getErpColor`, `FALLBACK_ERP_DATA`, `EmptyState`
- Framer Motion card animations (`motion.div` with `cardVariant`)
- Emerald/teal color scheme, border-border/60 styling
- `'use client'` directive
- No API routes modified

### Lint
- `npx eslint src/components/admin/integrations/integration-overview.tsx` — 0 errors, 0 warnings