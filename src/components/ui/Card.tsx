import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface P extends HTMLAttributes<HTMLDivElement> {}
export function Card({ className, ...p }: P) {
  return <div className={cn('rounded-2xl border border-border/60 bg-card text-card-foreground shadow-luxury', className)} {...p} />;
}
export function CardHeader({ className, ...p }: P) { return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...p} />; }
export function CardTitle({ className, ...p }: HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn('text-base font-semibold leading-none tracking-tight', className)} {...p} />; }
export function CardDescription({ className, ...p }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn('text-sm text-muted-foreground', className)} {...p} />; }
export function CardContent({ className, ...p }: P) { return <div className={cn('p-6 pt-0', className)} {...p} />; }
export function CardFooter({ className, ...p }: P) { return <div className={cn('flex items-center p-6 pt-0', className)} {...p} />; }
