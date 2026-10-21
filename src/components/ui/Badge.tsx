import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type V = 'default' | 'success' | 'warning' | 'destructive' | 'outline' | 'secondary' | 'gold';
interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { variant?: V; }
const vc: Record<V, string> = {
  default: 'bg-primary/10 text-primary border-transparent',
  gold: 'bg-gold/15 text-gold border-transparent',
  success: 'bg-success/12 text-success border-transparent',
  warning: 'bg-warning/14 text-warning border-transparent',
  destructive: 'bg-destructive/10 text-destructive border-transparent',
  outline: 'border-border text-foreground',
  secondary: 'bg-secondary text-secondary-foreground border-transparent',
};
export default function Badge({ className, variant = 'default', ...p }: BadgeProps) {
  return <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold leading-5', vc[variant], className)} {...p} />;
}
