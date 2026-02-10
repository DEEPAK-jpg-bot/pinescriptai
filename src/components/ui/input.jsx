import * as React from "react"
import { cn } from "../../utils/cn"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-11 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm mono shadow-inner transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-800 focus-visible:outline-none focus-visible:border-[#3B82F6]/50 focus-visible:ring-1 focus-visible:ring-[#3B82F6]/20 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export { Input }
