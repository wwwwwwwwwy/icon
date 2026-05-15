import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const svgDir = path.join(rootDir, 'svg');
const coreDir = path.join(rootDir, 'packages/core/src');
const reactDir = path.join(rootDir, 'packages/react/src');
const vueDir = path.join(rootDir, 'packages/vue/src');

const categoryPrefixes = new Map([
  ['action', 'Action'],
  ['nav', 'Nav'],
  ['bim', 'Bim']
]);

const collator = new Intl.Collator('zh-Hans-CN', { numeric: true });

function parseSvg(svg) {
  const openTagMatch = svg.match(/<svg\b([^>]*)>/i);
  const closeTagMatch = svg.match(/<\/svg>\s*$/i);
  if (!openTagMatch || !closeTagMatch) {
    throw new Error('Invalid SVG: missing root <svg> tag');
  }

  const attrs = {};
  const attrSource = openTagMatch[1];
  const attrPattern = /([:\w-]+)\s*=\s*"([^"]*)"/g;
  for (const match of attrSource.matchAll(attrPattern)) {
    attrs[match[1]] = match[2];
  }

  const bodyStart = openTagMatch.index + openTagMatch[0].length;
  const bodyEnd = closeTagMatch.index;
  return {
    attrs,
    body: svg.slice(bodyStart, bodyEnd).trim()
  };
}

function parseFileName(fileName) {
  const baseName = fileName.replace(/\.svg$/i, '');
  const separatorIndex = baseName.indexOf('-');
  if (separatorIndex === -1) {
    return { name: baseName, category: 'general', label: baseName };
  }
  return {
    name: baseName,
    category: baseName.slice(0, separatorIndex),
    label: baseName.slice(separatorIndex + 1)
  };
}

function componentNameFor(category, index) {
  const prefix = categoryPrefixes.get(category) ?? toPascalAscii(category) ?? 'Icon';
  return `${prefix}Icon${String(index).padStart(3, '0')}`;
}

function toPascalAscii(value) {
  const words = value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) {
    return null;
  }
  const result = words
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join('');
  return /^[A-Za-z]/.test(result) ? result : `Icon${result}`;
}

function jsString(value) {
  return JSON.stringify(value);
}

function objectLiteral(object, indent = 2) {
  const space = ' '.repeat(indent);
  const entries = Object.entries(object)
    .map(([key, value]) => `${space}${jsString(key)}: ${jsString(value)}`)
    .join(',\n');
  return `{\n${entries}\n${' '.repeat(indent - 2)}}`;
}

async function main() {
  const { readdir } = await import('node:fs/promises');
  const fileNames = (await readdir(svgDir))
    .filter((fileName) => fileName.toLowerCase().endsWith('.svg'))
    .sort(collator.compare);

  const categoryCounts = new Map();
  const icons = [];

  for (const fileName of fileNames) {
    const parsedName = parseFileName(fileName);
    const nextIndex = (categoryCounts.get(parsedName.category) ?? 0) + 1;
    categoryCounts.set(parsedName.category, nextIndex);

    const svg = await readFile(path.join(svgDir, fileName), 'utf8');
    const parsedSvg = parseSvg(svg);
    icons.push({
      ...parsedName,
      fileName,
      componentName: componentNameFor(parsedName.category, nextIndex),
      attrs: parsedSvg.attrs,
      body: parsedSvg.body
    });
  }

  await Promise.all([coreDir, reactDir, vueDir].map((dir) => mkdir(dir, { recursive: true })));

  await writeCore(icons);
  await writeReact(icons);
  await writeVue(icons);

  console.log(`Generated ${icons.length} icons.`);
}

async function writeCore(icons) {
  const metadata = icons.map(({ name, componentName, fileName, category, label }) => ({
    name,
    componentName,
    fileName,
    category,
    label
  }));

  const svgData = icons.map(({ componentName, attrs, body }) => ({
    componentName,
    attrs,
    body
  }));

  await writeFile(
    path.join(coreDir, 'icon-metadata.ts'),
    `export interface IconMetadata {
  name: string;
  componentName: string;
  fileName: string;
  category: string;
  label: string;
}

export const iconMetadata = ${JSON.stringify(metadata, null, 2)} as const satisfies readonly IconMetadata[];

export type IconName = (typeof iconMetadata)[number]['name'];
export type IconComponentName = (typeof iconMetadata)[number]['componentName'];
`,
    'utf8'
  );

  await writeFile(
    path.join(coreDir, 'icon-data.ts'),
    `export interface IconSvgData {
  componentName: string;
  attrs: Record<string, string>;
  body: string;
}

export const iconSvgData = ${JSON.stringify(svgData, null, 2)} as const satisfies readonly IconSvgData[];
`,
    'utf8'
  );

  await writeFile(
    path.join(coreDir, 'index.ts'),
    `export * from './icon-data.js';
export * from './icon-metadata.js';
`,
    'utf8'
  );
}

async function writeReact(icons) {
  await writeFile(
    path.join(reactDir, 'createIcon.tsx'),
    `import { forwardRef } from 'react';
import type { SVGProps } from 'react';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'dangerouslySetInnerHTML'> {
  size?: number | string;
  title?: string;
  secondaryColor?: string;
}

export function createIcon(displayName: string, attrs: Record<string, string>, body: string) {
  const Icon = forwardRef<SVGSVGElement, IconProps>(
    ({ size = attrs.width ?? 24, color = 'currentColor', title, secondaryColor = '#8b949e', style, ...props }, ref) => {
      const mergedStyle = {
        color,
        '--mi-icon-secondary': secondaryColor,
        ...style
      } as React.CSSProperties;

      return (
        <svg
          {...attrs}
          {...props}
          ref={ref}
          width={props.width ?? size}
          height={props.height ?? size}
          aria-hidden={title ? undefined : true}
          role={title ? 'img' : undefined}
          style={mergedStyle}
          dangerouslySetInnerHTML={{ __html: title ? \`<title>\${escapeHtml(title)}</title>\${body}\` : body }}
        />
      );
    }
  );
  Icon.displayName = displayName;
  return Icon;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
`,
    'utf8'
  );

  const iconExports = icons.map((icon) => {
    return `export const ${icon.componentName} = createIcon(${jsString(icon.componentName)}, ${objectLiteral(icon.attrs)}, ${jsString(icon.body)});`;
  });

  await writeFile(
    path.join(reactDir, 'icons.tsx'),
    `import { createIcon } from './createIcon.js';

${iconExports.join('\n')}
`,
    'utf8'
  );

  await writeFile(
    path.join(reactDir, 'index.ts'),
    `export * from './createIcon.js';
export * from './icons.js';
export { iconMetadata } from '@meri-design/icon-core';
export type { IconMetadata, IconName, IconComponentName } from '@meri-design/icon-core';
`,
    'utf8'
  );
}

async function writeVue(icons) {
  await writeFile(
    path.join(vueDir, 'createIcon.ts'),
    `import { defineComponent, h } from 'vue';
import type { PropType, SVGAttributes } from 'vue';

export interface IconProps extends SVGAttributes {
  size?: number | string;
  title?: string;
  secondaryColor?: string;
}

export function createIcon(displayName: string, attrs: Record<string, string>, body: string) {
  return defineComponent({
    name: displayName,
    props: {
      size: {
        type: [Number, String],
        default: attrs.width ?? 24
      },
      title: String,
      color: {
        type: String,
        default: 'currentColor'
      },
      secondaryColor: String,
      style: {
        type: [String, Object, Array] as PropType<IconProps['style']>,
        default: undefined
      }
    },
    setup(props, { attrs: runtimeAttrs }) {
      return () => {
        const titleMarkup = props.title ? \`<title>\${escapeHtml(props.title)}</title>\` : '';
        return h('svg', {
          ...attrs,
          ...runtimeAttrs,
          width: runtimeAttrs.width ?? props.size,
          height: runtimeAttrs.height ?? props.size,
          'aria-hidden': props.title ? undefined : 'true',
          role: props.title ? 'img' : undefined,
          style: {
            color: props.color,
            '--mi-icon-secondary': props.secondaryColor ?? '#8b949e',
            ...(typeof props.style === 'object' && !Array.isArray(props.style) ? props.style : {})
          },
          innerHTML: \`\${titleMarkup}\${body}\`
        });
      };
    }
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
`,
    'utf8'
  );

  const iconExports = icons.map((icon) => {
    return `export const ${icon.componentName} = createIcon(${jsString(icon.componentName)}, ${objectLiteral(icon.attrs)}, ${jsString(icon.body)});`;
  });

  await writeFile(
    path.join(vueDir, 'icons.ts'),
    `import { createIcon } from './createIcon.js';

${iconExports.join('\n')}
`,
    'utf8'
  );

  await writeFile(
    path.join(vueDir, 'index.ts'),
    `export * from './createIcon.js';
export * from './icons.js';
export { iconMetadata } from '@meri-design/icon-core';
export type { IconMetadata, IconName, IconComponentName } from '@meri-design/icon-core';
`,
    'utf8'
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
