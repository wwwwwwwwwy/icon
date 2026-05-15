import { defineComponent, h } from 'vue';
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
        const titleMarkup = props.title ? `<title>${escapeHtml(props.title)}</title>` : '';
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
          innerHTML: `${titleMarkup}${body}`
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
