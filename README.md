# MI Icons

一个类似 lucide 的 SVG icon library 脚手架，当前支持 React 和 Vue 3。

## Scripts

```bash
npm install
npm run generate
npm run build
npm run verify
bun run docs:dev
bun run docs:build
```

## Docs Site

GitHub Pages:

```txt
https://wwwwwwwwwy.github.io/icon/
```

## Publish

```bash
NPM_TOKEN=... bun run publish:packages
```

If the npm account requires two-factor authentication:

```bash
NPM_TOKEN=... NPM_OTP=123456 bun run publish:packages
```

This bumps all icon packages by one patch version, builds and verifies the packages, then publishes:

- `@meri-design/icon-core`
- `@meri-design/icon-react`
- `@meri-design/icon-vue`

## GitHub Automation

The repository deploys the docs site to GitHub Pages on every push to `main`.

The npm publish workflow runs on pushes to `main`, but only publishes when the
versions in all package manifests change:

- `packages/core/package.json`
- `packages/react/package.json`
- `packages/vue/package.json`

Before using the npm workflow, add a GitHub repository secret:

```bash
gh secret set NPM_TOKEN
```

Use an npm automation token so CI can publish without an interactive OTP prompt.

To release a new package version locally:

```bash
bun run version:packages
bun run verify
git add packages/core/package.json packages/react/package.json packages/vue/package.json
git commit -m "Release icon packages"
git push origin main
```

## Source

把 SVG 放入 `svg/`。文件名会被解析为：

- `category`: 第一个 `-` 前的内容，例如 `action`
- `label`: 第一个 `-` 后的内容，例如 `记录`
- `componentName`: 稳定生成，例如 `ActionIcon001`

## Packages

- `@meri-design/icon-core`: SVG 数据和元数据
- `@meri-design/icon-react`: React 组件，依赖 `@meri-design/icon-core`
- `@meri-design/icon-vue`: Vue 3 组件，依赖 `@meri-design/icon-core`
- `@mi-icons/docs`: React + Vite 文档预览应用

## Usage

```tsx
import { ActionIcon001 } from '@meri-design/icon-react';

export function Demo() {
  return <ActionIcon001 size={32} color="#111827" secondaryColor="#8b949e" title="记录" />;
}
```

```vue
<script setup lang="ts">
import { ActionIcon001 } from '@meri-design/icon-vue';
</script>

<template>
  <ActionIcon001 :size="32" color="#111827" secondary-color="#8b949e" title="记录" />
</template>
```


codex resume 019e2615-32a3-7032-89c4-5b83bf6eac93
