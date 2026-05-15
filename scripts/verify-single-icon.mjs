import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createSSRApp, h } from 'vue';
import { renderToString } from '@vue/server-renderer';
import { ActionIcon001 as ReactIcon, iconMetadata as reactMetadata } from '../packages/react/dist/index.js';
import { ActionIcon001 as VueIcon, iconMetadata as vueMetadata } from '../packages/vue/dist/index.js';

const verifiedIcon = reactMetadata.find((icon) => icon.componentName === 'ActionIcon001');
if (!verifiedIcon) {
  throw new Error('ActionIcon001 metadata should exist');
}

const reactHtml = renderToStaticMarkup(
  createElement(ReactIcon, {
    size: 32,
    color: '#111827',
    title: verifiedIcon.label
  })
);

const vueHtml = await renderToString(
  createSSRApp({
    render: () =>
      h(VueIcon, {
        size: 32,
        color: '#111827',
        title: verifiedIcon.label
      })
  })
);

assertIncludes(reactHtml, '<svg', 'React render should include svg');
assertIncludes(reactHtml, `<title>${verifiedIcon.label}</title>`, 'React render should include title');
assertIncludes(reactHtml, '--mi-icon-secondary:#8b949e', 'React render should include default secondary color');
assertIncludes(vueHtml, '<svg', 'Vue render should include svg');
assertIncludes(vueHtml, `<title>${verifiedIcon.label}</title>`, 'Vue render should include title');
assertIncludes(vueHtml, '--mi-icon-secondary:#8b949e', 'Vue render should include default secondary color');

if (reactMetadata.length !== vueMetadata.length) {
  throw new Error(`Metadata length mismatch: react=${reactMetadata.length}, vue=${vueMetadata.length}`);
}

if (reactMetadata.length === 0) {
  throw new Error('Metadata should not be empty');
}

console.log(`Verified ${verifiedIcon.componentName} (${verifiedIcon.label}) for React and Vue. iconCount=${reactMetadata.length}`);

function assertIncludes(value, expected, message) {
  if (!value.includes(expected)) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)} in ${value}`);
  }
}
