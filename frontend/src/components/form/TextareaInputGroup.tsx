import {forwardRef} from "react";
import {Label} from "@/components/ui/label";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    labelClassName?: string;
    showRequired?: boolean;
    error?: string;
}

export const TextareaInputGroup = forwardRef<
    HTMLTextAreaElement,
    TextareaProps
>(
    (
        {
            label,
            error,
            labelClassName = "",
            className = "",
            showRequired = false,
            ...props
        },
        ref,
    ) => {
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

                <textarea
                    {...props}
                    ref={ref}
                    aria-invalid={!!error}
                    className={`
                        flex w-full rounded-lg border border-border bg-secondary 
                        px-4 py-3 text-sm text-card-foreground 
                        placeholder:text-muted-foreground 
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring 
                        disabled:cursor-not-allowed disabled:opacity-50
                        min-h-[120px] resize-y
                        ${error ? "border-destructive focus-visible:ring-destructive" : ""}
                        ${className}
                    `}
                />

                {error && (
                    <span className="text-sm text-destructive font-medium">
                        {error}
                    </span>
                )}
            </div>
        );
    },
);

TextareaInputGroup.displayName = "TextareaInputGroup";
