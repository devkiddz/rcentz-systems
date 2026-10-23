import Image from "next/image";

export function RcentzBrandLogo({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/brands/rcentz/rcentz-cr-lockup-light.svg"
        width={1785}
        height={320}
        alt="Rcentz"
        unoptimized
        className="block h-auto w-full dark:hidden"
      />
      <Image
        src="/brands/rcentz/rcentz-cr-lockup-dark.svg"
        width={1785}
        height={320}
        alt="Rcentz"
        unoptimized
        className="hidden h-auto w-full dark:block"
      />
    </span>
  );
}
