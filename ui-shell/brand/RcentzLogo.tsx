import { RcentzMark } from './RcentzMark';

type RcentzLogoProps = {
  compact?: boolean;
  className?: string;
};

export function RcentzLogo({
  compact = false,
  className = '',
}: RcentzLogoProps) {
  return (
    <span
      aria-hidden="true"
      className={[
        'flex shrink-0 items-center justify-center rounded-full',
        'bg-brand-logo-background text-brand-logo-foreground',
        compact ? 'size-6' : 'size-7',
        className,
      ].join(' ')}>
      <RcentzMark
        title=""
        className={compact ? 'size-3.5' : 'size-4'}
      />
    </span>
  );
}
