import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
    variant?: "default" | "outline" | "ghost" | "destructive" | "link"
    size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"

        const variants = {
            default: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm",
            outline: "border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white",
            ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300",
            destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm",
            link: "text-emerald-500 underline-offset-4 hover:underline"
        } as const;

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
        } as const;

        const variantClass = variants[variant] || variants.default;
        const sizeClass = sizes[size] || sizes.default;

        return (
            <Comp
                className={cn(
                    "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
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
