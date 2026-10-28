import Image from 'next/image';
import { rcentzTypography } from './rcentz-typography';

type RcentzBrandLockupProps = {
  className?: string;
};

export function RcentzBrandLockup({
  className = '',
}: RcentzBrandLockupProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 whitespace-nowrap ${className}`}
      aria-label="Rcentz Systems"
    >
      <span className="relative block size-7 shrink-0">
        <Image
          src="/brand/rcentz-mark-light.svg"
          alt=""
          fill
          sizes="28px"
          unoptimized
          className="object-contain dark:hidden"
        />
        <Image
          src="/brand/rcentz-mark-dark.svg"
          alt=""
          fill
          sizes="28px"
          unoptimized
          className="hidden object-contain dark:block"
        />
      </span>
      <span
        className={`${rcentzTypography.className} text-[19px] sm:text-[20px] font-bold tracking-[0.015em] leading-none text-foreground`}
      >
        Systems
      </span>
    </span>
  );
}
