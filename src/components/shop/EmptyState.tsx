import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn('flex flex-col items-center justify-center px-4 py-16 text-center', className)}
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        {/* Radar ping rings */}
        <motion.span
          initial={{ scale: 0.6, opacity: 0.4 }}
          animate={{ scale: [0.6, 1.5], opacity: [0.35, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
          className="absolute inset-0 rounded-full bg-primary/20"
        />
        <motion.span
          initial={{ scale: 0.6, opacity: 0.4 }}
          animate={{ scale: [0.6, 1.5], opacity: [0.35, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
          className="absolute inset-0 rounded-full bg-primary/20"
        />
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0, y: [0, -5, 0] }}
          transition={{ scale: { type: 'spring', stiffness: 260, damping: 18 }, rotate: { type: 'spring', stiffness: 260, damping: 18 }, y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } }}
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/10"
        >
          <Icon className="h-10 w-10" />
        </motion.div>
      </div>
      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-6 font-editorial text-xl font-medium text-foreground"
      >
        {title}
      </motion.h3>
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          className="mt-2 max-w-md text-sm text-muted-foreground"
        >
          {description}
        </motion.p>
      )}
      {actionLabel && onAction && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
          <Button onClick={onAction} className="mt-6">{actionLabel}</Button>
        </motion.div>
      )}
    </motion.div>
  );
}
