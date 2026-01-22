import clsx from 'clsx';

interface DynamoHamburgerProps {
  open: boolean;
  onToggle: () => void;
  label?: string;
  className?: string;
  size?: number;
}

const DynamoHamburger = ({
  open,
  onToggle,
  label = 'Toggle navigation',
  className,
  size = 24
}: DynamoHamburgerProps) => {
  const lineHeight = Math.max(2, Math.round(size * 0.12));
  const lineOffset = (size * 0.75 - lineHeight) / 2;
  const timingFunction = 'cubic-bezier(0.65, 0, 0.35, 1)';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={label}
      className={clsx(
        'relative flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-white/80 transition hover:border-neonCyan hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-neonCyan/60',
        className
      )}
    >
      <span
        className="relative block"
        style={{ width: size, height: size * 0.75, minHeight: lineHeight * 4 }}
      >
        <span
          className={clsx(
            'absolute left-0 w-full origin-center rounded-full bg-current transition-all duration-300'
          )}
          style={{
            top: 0,
            height: lineHeight,
            transform: open
              ? `translateY(${lineOffset}px) rotate(45deg)`
              : 'translateY(0) rotate(0deg)',
            transitionTimingFunction: timingFunction
          }}
        />
        <span
          className={clsx(
            'absolute left-0 w-full origin-center rounded-full bg-current transition-all duration-300'
          )}
          style={{
            top: lineOffset,
            height: lineHeight,
            opacity: open ? 0 : 1,
            transform: open ? 'scaleX(0.5)' : 'scaleX(1)',
            transitionTimingFunction: timingFunction
          }}
        />
        <span
          className={clsx(
            'absolute left-0 w-full origin-center rounded-full bg-current transition-all duration-300'
          )}
          style={{
            top: lineOffset * 2,
            height: lineHeight,
            transform: open
              ? `translateY(-${lineOffset}px) rotate(-45deg)`
              : 'translateY(0) rotate(0deg)',
            transitionTimingFunction: timingFunction
          }}
        />
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
};

export default DynamoHamburger;
