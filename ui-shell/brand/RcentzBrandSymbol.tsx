import Image from "next/image";

export function RcentzBrandSymbol({
  className = "",
}: {
  className?: string;
}) {
  return (
    <Image
      src="/brands/rcentz/rcentz-cr-symbol-blue.svg"
      width={128}
      height={128}
      alt=""
      aria-hidden="true"
      unoptimized
      className={className}
    />
  );
}
