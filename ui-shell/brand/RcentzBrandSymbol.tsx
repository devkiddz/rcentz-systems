import Image from 'next/image';

export function RcentzBrandSymbol({
  className = '',
}: {
  className?: string;
}) {
  return (
    <>
      <Image
        src="/brand/rcentz-mark-light.svg"
        width={128}
        height={128}
        alt=""
        aria-hidden="true"
        unoptimized
        className={`dark:hidden ${className}`}
      />
      <Image
        src="/brand/rcentz-mark-dark.svg"
        width={128}
        height={128}
        alt=""
        aria-hidden="true"
        unoptimized
        className={`hidden dark:block ${className}`}
      />
    </>
  );
}
