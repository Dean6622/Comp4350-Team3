import * as React from "react";
import { cn } from "@/lib/utils";

const AuthInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props },
                ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "w-full px-4 py-2 border-b border-gray-300 " +
                    "bg-transparent focus:outline-none focus:border-purple-500",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
);

AuthInput.displayName = "AuthInput";

export { AuthInput };
