import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function Page({ title, eyebrow, action, children }: { title: string; eyebrow?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24 }}
      className="mx-auto grid w-full max-w-7xl gap-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p>}
          <h1 className="text-3xl font-bold tracking-normal text-[var(--text)] sm:text-4xl">{title}</h1>
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  );
}
