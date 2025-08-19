import { cn } from '@/lib/utils';

const Input = ({
  className = '',
  type = 'text',
  error = false,
  errorMessage = '',
  ...props
}) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
      />
      {error && errorMessage && (
        <p className="mt-1 text-sm text-destructive">{errorMessage}</p>
      )}
    </div>
  );
};

export default Input;
