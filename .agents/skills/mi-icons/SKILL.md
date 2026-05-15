---
name: mi-icons
description: Use when selecting, explaining, or integrating the MI Icons React/Vue 3 icon library from /Users/wangying/Documents/icon. Includes icon naming rules, default colors, React/Vue usage, and a catalog of every generated icon.
---

# MI Icons

Use this skill when the user asks an Agent to choose an icon, explain an icon, add MI Icons to React/Vue 3 UI code, or map a business action/navigation label to an icon component.

## Source Of Truth

- Project root: `/Users/wangying/Documents/icon`
- SVG sources: `svg/*.svg`
- Metadata: `packages/core/src/icon-metadata.ts`
- Core package: `@meri-design/icon-core`
- React exports: `@meri-design/icon-react`
- Vue 3 exports: `@meri-design/icon-vue`
- Full icon catalog: read `references/icon-catalog.md` when exact component names or per-icon meanings are needed.

## Icon Semantics

Icon meanings are inferred from the SVG file name label:

- `action-*`: action, command, status, tool, or operation icons.
- `nav-*`: navigation/menu entry icons.
- `bim-*`: BIM/domain module icons.

Do not invent business meanings beyond the label. If a label is ambiguous, describe it as "used for <label>-related UI".

## Component Naming

Component names are deterministic ASCII-safe fallbacks:

- `ActionIcon001`, `ActionIcon002`, ...
- `BimIcon001`, `BimIcon002`, ...
- `NavIcon001`, `NavIcon002`, ...

Use `iconMetadata` to map Chinese labels and original filenames back to component names.

## Default Styling

All components support:

- `size`: number or string.
- `color`: primary color, defaults to `currentColor`.
- `secondaryColor` / `secondary-color`: secondary color, defaults to `#8b949e`.
- `title`: accessible title. Provide it when the icon conveys meaning.

The SVG source uses:

- `currentColor` for primary paths.
- `var(--mi-icon-secondary)` for secondary paths.

## React Usage

```tsx
import { ActionIcon001 } from '@meri-design/icon-react';

export function SaveButtonIcon() {
  return (
    <ActionIcon001
      size={32}
      color="#172033"
      secondaryColor="#8b949e"
      title="保存"
    />
  );
}
```

## Vue 3 Usage

```vue
<script setup lang="ts">
import { ActionIcon001 } from '@meri-design/icon-vue';
</script>

<template>
  <ActionIcon001
    :size="32"
    color="#172033"
    secondary-color="#8b949e"
    title="保存"
  />
</template>
```

## Selection Workflow

1. Read `references/icon-catalog.md` if the user asks for a specific icon, an icon meaning, or a mapping from text to icon.
2. Match by exact `label` first.
3. If exact match is unavailable, match by related UI intent within the same category.
4. Prefer `action-*` icons for buttons and operations.
5. Prefer `nav-*` icons for sidebar, tabs, menus, and route entries.
6. Prefer `bim-*` icons for BIM or domain module surfaces.
7. Return the component name and a React/Vue usage snippet when implementation is requested.

## Verification

After changing icon generation or docs:

```bash
bun run verify
bun run docs:build
```
