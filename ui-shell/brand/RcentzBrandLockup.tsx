import Image from 'next/image';

type RcentzBrandLockupProps = {
  className?: string;
};

export function RcentzBrandLockup({
  className = '',
}: RcentzBrandLockupProps) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <Image
        src="/brands/rcentz/systems-cr-lockup-light.svg"
        width={1785}
        height={320}
        alt="Systems"
        unoptimized
        className="block h-auto w-full dark:hidden"
      />
      <Image
        src="/brands/rcentz/systems-cr-lockup-dark.svg"
        width={1785}
        height={320}
        alt="Systems"
        unoptimized
        className="hidden h-auto w-full dark:block"
      />
    </span>
  );
}
