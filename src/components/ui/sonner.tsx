import { Toaster as SonnerToaster, toast } from 'sonner';
import type { ToasterProps } from 'sonner';
import 'sonner/dist/styles.css';
import { AppMessage } from '../../model/types';
import { cn } from '../../utils/utils';

export function showAppToast(message: AppMessage) {
  if (message.type === 'error') {
    toast.error(message.text);
    return;
  }

  if (message.type === 'success') {
    toast.success(message.text);
    return;
  }

  toast(message.text);
}

export function AppToaster(props: ToasterProps) {
  return (
    <SonnerToaster
      theme="dark"
      position="top-right"
      closeButton
      toastOptions={{
        classNames: {
          toast: cn('border border-[var(--border)] bg-[var(--bg-light)] text-[var(--txt)] shadow-xl'),
          title: cn('text-[var(--txt)] font-semibold'),
          description: cn('text-[var(--txt-light)]'),
          closeButton: cn('border-[var(--border)] bg-[var(--bg-light)] text-[var(--txt-light)] hover:text-[var(--txt)]'),
          success: cn('border-[var(--safe)]/50'),
          error: cn('border-[var(--danger)]/50'),
          info: cn('border-[var(--border)]'),
          actionButton: cn('bg-[var(--acc-p)] text-[var(--txt)]'),
          cancelButton: cn('bg-[var(--acc-s)] text-[var(--txt)]')
        }
      }}
      {...props}
    />
  );
}