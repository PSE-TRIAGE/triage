import {Eye, EyeOff} from "lucide-react";
import {forwardRef, useState} from "react";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    labelClassName?: string;
    showRequired?: boolean;
    error?: string;
}

// Usage of forwardRef, for RHF input registration
export const InputGroup = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            labelClassName = "",
            className = "",
            showRequired = false,
            type,
            ...props
        },
        ref,
    ) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === "password";

        const inputType = isPassword
            ? showPassword
                ? "text"
                : "password"
            : type;

        return (
            <div className="flex flex-col gap-2 w-full">
                <Label
                    className={`text-card-foreground text-sm font-medium ${labelClassName}`}
                >
                    {label}
                    {showRequired && (
                        <span className="text-destructive"> *</span>
                    )}
                </Label>

                <div className="relative group">
                    <Input
                        {...props}
                        ref={ref}
                        type={inputType}
                        aria-invalid={!!error}
                        className={`
              w-full bg-secondary border border-border
              rounded-lg px-4 py-3 text-card-foreground placeholder-muted-foreground outline-none 
              ${error ? "border-destructive focus:ring-destructive" : ""}
              ${className}
            `}
                    />

                    {isPassword && (
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground/60 p-1"
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </Button>
                    )}
                </div>

                {error && (
                    <span className="text-sm text-destructive font-medium">
                        {error}
                    </span>
                )}
            </div>
        );
    },
);
