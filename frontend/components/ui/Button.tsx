import * as React from "react";
import { cn } from "@/lib/utils";

const AuthButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "w-full bg-customMirage hover:bg-gray-700 text-white py-2 px-4 rounded-lg focus:outline-none " +
                    "focus:ring focus:ring-purple-300",
                    className
                )}
                {...props}
            >
                {children}
            </button>
        );
    }
);

AuthButton.displayName = "AuthButton";

export { AuthButton };
