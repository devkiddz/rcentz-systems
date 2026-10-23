import type { SVGProps } from "react";

export function RcentzSymbol({
  className = "",
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
        href="/brands/rcentz/rcentz-cr-symbol-blue.svg"
        width="128"
        height="128"
      />
    </svg>
  );
}
