import * as React from 'react';
import { cn } from '../../utils/utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-24 w-full rounded-md border border-[var(--border)] bg-[var(--bg-light)] px-3 py-2 text-sm text-[var(--txt)] shadow-sm transition-colors placeholder:text-[var(--txt-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--highlight)] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export { Textarea };