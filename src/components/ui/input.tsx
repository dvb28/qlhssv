import * as React from 'react';

import { cn } from '@/lib/utils';
import { Button } from './button';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    // Is hide
    const [isHide, setIsHide] = React.useState<boolean>(true);

    // On Hide
    const onHide = () => setIsHide(prev => !prev);

    // Return
    return (
      <div className="relative">
        <input
          type={type === 'password' ? isHide ? 'password' : 'text' : type}
          className={cn(
            `${
              type === 'file' ? 'py-1.5 px-2 cursor-pointer' : 'px-3 py-1'
            } flex h-9 w-full rounded-md border border-input bg-transparent text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50`,
            className,
          )}
          ref={ref}
          {...props}
        />
        {type === 'password' && (
          <div className="absolute right-[5px] top-[54%] translate-y-[-50%]">
            <Button variant="outline" className="h-6 w-6 p-1" onClick={e => {
              // Stop default
              e.preventDefault();

              // On hide
              onHide();
            }}>
              {!isHide ? <Eye size={20} /> : <EyeOff size={20} />}
            </Button>
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
