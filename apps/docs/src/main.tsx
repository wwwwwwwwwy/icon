import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as icons from '@meri-design/icon-react';
import { iconMetadata } from '@meri-design/icon-core';
import type { ComponentType } from 'react';
import type { IconProps } from '@meri-design/icon-react';
import './styles.css';

type Category = 'all' | string;

const iconComponents = icons as Record<string, ComponentType<IconProps> | unknown>;

function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [size, setSize] = useState(32);
  const [primaryColor, setPrimaryColor] = useState('#172033');
  const [secondaryColor, setSecondaryColor] = useState('#8b949e');
  const [copied, setCopied] = useState<string | null>(null);

  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(iconMetadata.map((icon) => icon.category)))];
  }, []);

  const filteredIcons = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return iconMetadata.filter((icon) => {
      const matchesCategory = category === 'all' || icon.category === category;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        icon.name.toLowerCase().includes(normalizedQuery) ||
        icon.componentName.toLowerCase().includes(normalizedQuery) ||
        icon.label.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  async function copyName(componentName: string) {
    await navigator.clipboard.writeText(componentName);
    setCopied(componentName);
    window.setTimeout(() => setCopied(null), 1200);
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">MI Icons</p>
          <h1>React 和 Vue 3 图标库文档</h1>
          <p className="hero-text">
            从 SVG 源文件生成可 tree-shaking 的组件包，当前包含 {iconMetadata.length} 个图标。
          </p>
        </div>
        <div className="hero-sample" aria-label="图标预览">
          {iconMetadata.slice(0, 9).map((icon) => {
            const Icon = iconComponents[icon.componentName] as ComponentType<IconProps>;
            return (
              <span className="sample-tile" key={icon.name}>
                <Icon size={30} color={primaryColor} secondaryColor={secondaryColor} title={icon.label} />
              </span>
            );
          })}
        </div>
      </section>

      <section className="toolbar" aria-label="图标筛选和样式控制">
        <label className="field search-field">
          <span>搜索</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入中文说明、文件名或组件名"
          />
        </label>

        <label className="field">
          <span>尺寸</span>
          <input
            type="range"
            min="16"
            max="64"
            value={size}
            onChange={(event) => setSize(Number(event.target.value))}
          />
          <strong>{size}px</strong>
        </label>

        <label className="field color-field">
          <span>主色</span>
          <input type="color" value={primaryColor} onChange={(event) => setPrimaryColor(event.target.value)} />
        </label>

        <label className="field color-field">
          <span>副色</span>
          <input type="color" value={secondaryColor} onChange={(event) => setSecondaryColor(event.target.value)} />
        </label>
      </section>

      <nav className="category-tabs" aria-label="图标分类">
        {categories.map((item) => (
          <button
            className={item === category ? 'active' : ''}
            key={item}
            type="button"
            onClick={() => setCategory(item)}
          >
            {item === 'all' ? '全部' : item}
          </button>
        ))}
      </nav>

      <section className="content-grid">
        <aside className="usage-panel">
          <h2>安装与使用</h2>
          <pre>{`bun add @meri-design/icon-react @meri-design/icon-vue`}</pre>
          <h3>React</h3>
          <pre>{`import { ActionIcon001 } from '@meri-design/icon-react';

<ActionIcon001
  size={32}
  color="#172033"
  secondaryColor="#8b949e"
  title="保存"
/>`}</pre>
          <h3>Vue 3</h3>
          <pre>{`<script setup lang="ts">
import { ActionIcon001 } from '@meri-design/icon-vue';
</script>

<template>
  <ActionIcon001
    :size="32"
    color="#172033"
    secondary-color="#8b949e"
    title="保存"
  />
</template>`}</pre>
        </aside>

        <section className="icons-section">
          <div className="result-line">
            <span>{filteredIcons.length} 个结果</span>
            <span>点击卡片复制组件名</span>
          </div>

          <div className="icon-grid">
            {filteredIcons.map((icon) => {
              const Icon = iconComponents[icon.componentName] as ComponentType<IconProps> | undefined;
              if (!Icon) {
                return null;
              }
              return (
                <button className="icon-card" key={icon.name} type="button" onClick={() => copyName(icon.componentName)}>
                  <span className="icon-preview">
                    <Icon size={size} color={primaryColor} secondaryColor={secondaryColor} title={icon.label} />
                  </span>
                  <span className="icon-label">{icon.label}</span>
                  <code>{icon.componentName}</code>
                  <small>{copied === icon.componentName ? '已复制' : icon.fileName}</small>
                </button>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
