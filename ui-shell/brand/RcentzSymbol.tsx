import type { SVGProps } from 'react';

export function RcentzSymbol({
  className = '',
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 128 128"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <image
        href="/brand/rcentz-mark-light.svg"
        width="128"
        height="128"
        className="dark:hidden"
      />
      <image
        href="/brand/rcentz-mark-dark.svg"
        width="128"
        height="128"
        className="hidden dark:block"
      />
    </svg>
  );
}
