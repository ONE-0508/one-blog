import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast: '!border !border-border-subtle !bg-bg-elevated !text-text-primary !shadow-soft',
          success:
            '!border-accent-primary/50 !bg-accent-primary/12 !text-text-primary [&_[data-icon]]:!text-accent-primary',
          warning:
            '!border-amber-500/50 !bg-amber-500/12 !text-amber-200 [&_[data-icon]]:!text-amber-400',
          error: '!border-red-500/50 !bg-red-500/12 !text-red-200 [&_[data-icon]]:!text-red-400',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
