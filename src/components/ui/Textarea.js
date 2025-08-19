import { cn } from '@/lib/utils';

const Textarea = ({
  className = '',
  error = false,
  errorMessage = '',
  rows = 4,
  ...props
}) => {
  return (
    <div className="w-full">
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        rows={rows}
        {...props}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
};

export default Textarea;
