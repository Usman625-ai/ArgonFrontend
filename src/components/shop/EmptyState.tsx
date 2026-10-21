import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui';

interface EmptyStateProps {
  icon: LucideIcon; title: string; description?: string;
  actionLabel?: string; onAction?: () => void; className?: string;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
      className={cn('flex flex-col items-center justify-center px-4 py-20 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary"><Icon className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} /></div>
      <h3 className="mt-6 font-editorial text-3xl">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>}
      {actionLabel && onAction && <Button onClick={onAction} className="mt-7">{actionLabel}</Button>}
    </motion.div>
  );
}
