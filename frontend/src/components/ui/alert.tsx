import * as React from 'react';

import { cn } from '../../utils/cn';

function Alert({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      role="alert"
      data-slot="alert"
      className={cn('rounded-lg border px-4 py-3 text-sm', className)}
      {...props}
    />
  );
}

export { Alert };
