import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "outline" | "ghost" | "destructive"
    size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        const variants = {
            default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
            outline: "border border-slate-200 bg-white hover:bg-slate-100 text-slate-900",
            ghost: "hover:bg-slate-100 text-slate-700",
            destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm"
        } as const;

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8"
        } as const;

        const variantClass = variants[variant] || variants.default;
        const sizeClass = sizes[size] || sizes.default;

        return (
            <Comp
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variantClass,
                    sizeClass,
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
