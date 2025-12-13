import { cn } from "../../lib/utils"
import { forwardRef } from "react"

export const Checkbox = forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      className={cn(
        "h-4 w-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 focus:ring-2 focus:ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})