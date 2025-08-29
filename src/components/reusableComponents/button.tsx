import * as React from "react"
import { cn } from "@/lib/utils"

function Button({ className, leftIcon, children, ...props }: React.ComponentProps<"button"> & { leftIcon?: React.ReactNode }) {
  return (
    <button
      className={cn("inline-flex items-center gap-2 h-9 px-3 font-[500] !text-textSlateBlack rounded-lg text-sm !bg-neonGreen shadow-[0px_0px_0px_1px_#1F6619,0px_1px_2px_0px_#1F661966,0px_0.75px_0px_0px_#FFFFFF33_inset] hover:shadow-[0px_0px_0px_1px_#1F6619,0px_4px_8px_2px_#1F661966,0px_0.75px_0px_0px_#FFFFFF33_inset] transition-shadow duration-300 ease-in-out cursor-pointer", className)}
      {...props}
    >
      {leftIcon && leftIcon}
      {children}
    </button>
  )
}

export { Button }

