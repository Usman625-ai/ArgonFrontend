import { cn } from '../../lib/utils';

interface LogoProps {
  /** Pixel size of the mark (square). Default 32. */
  size?: number;
  /** Show the "Argon" wordmark next to the mark. Default true. */
  withWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

/**
 * Argon brand mark — a faceted "A" monogram rendered as inline SVG so it
 * stays crisp at any size and inherits no raster artifacts. Uses a fixed
 * gold gradient (matches --primary across light/dark) rather than
 * currentColor, so the mark reads consistently on both themes.
 */
export default function Logo({ size = 32, withWordmark = true, className, wordmarkClassName }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="argonGoldMark" x1="14" y1="8" x2="86" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#E9CB99" />
            <stop offset="0.42" stopColor="#C19057" />
            <stop offset="1" stopColor="#7A4F27" />
          </linearGradient>
          <linearGradient id="argonShineMark" x1="30" y1="8" x2="55" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M50,8 L86,90 L14,90 Z M50,40 L64.1,72 L35.9,72 Z"
          fillRule="evenodd"
          fill="url(#argonGoldMark)"
        />
        <path d="M50,8 L61,32 L50,40 L40,32 Z" fill="url(#argonShineMark)" />
      </svg>
      {withWordmark && (
        <span className={cn('font-editorial font-medium tracking-tight text-foreground', wordmarkClassName)}>
          Argon
        </span>
      )}
    </span>
  );
}
