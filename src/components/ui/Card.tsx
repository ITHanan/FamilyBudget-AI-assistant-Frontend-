import { HTMLAttributes } from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';
import { cn } from '../../lib/format';

export function Card({ className, ...props }: HTMLMotionProps<'article'>) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, boxShadow: '0 18px 50px rgba(15, 23, 42, 0.12)' }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={cn('rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]', className)}
      {...props}
    />
  );
}

export function StaticCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]', className)} {...props} />;
}
