import * as React from 'react';

import { cn } from '../../utils/cn';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'w-full rounded-[var(--radius-md)] border border-border-subtle bg-bg-elevated-soft px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-accent-primary/60 focus:ring-2 focus:ring-accent-primary/20 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Input };
