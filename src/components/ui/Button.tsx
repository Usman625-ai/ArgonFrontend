import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type Variant = 'default' | 'outline' | 'ghost' | 'destructive' | 'success' | 'link' | 'gold';
type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; loading?: boolean;
}

const vc: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  gold: 'bg-gold text-white hover:bg-gold/90',
  outline: 'border border-input bg-card text-foreground hover:bg-accent',
  ghost: 'text-foreground hover:bg-accent',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  success: 'bg-success text-success-foreground hover:bg-success/90',
  link: 'text-foreground underline underline-offset-4 hover:text-primary',
};
const sc: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.8rem]',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-[0.95rem]',
  icon: 'h-10 w-10 p-0',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'relative inline-flex select-none items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,transform,opacity] duration-200 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 disabled:active:scale-100',
        vc[variant], sc[size], className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';
export default Button;
