import { forwardRef } from 'react';
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
          dangerouslySetInnerHTML={{ __html: title ? `<title>${escapeHtml(title)}</title>${body}` : body }}
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
