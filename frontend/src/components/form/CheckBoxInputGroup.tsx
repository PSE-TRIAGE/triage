import {forwardRef} from "react";
import {Label} from "@/components/ui/label";
import {CheckIcon} from "lucide-react";

export interface CheckboxGroupProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    labelClassName?: string;
    showRequired?: boolean;
    error?: string;
}

export const CheckBoxInputGroup = forwardRef<
    HTMLInputElement,
    CheckboxGroupProps
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
                <div className="flex items-center gap-3">
                    <Label
                        htmlFor={props.id || props.name}
                        className={`text-card-foreground text-sm font-medium cursor-pointer ${labelClassName}`}
                    >
                        {label}
                        {showRequired && (
                            <span className="text-destructive"> *</span>
                        )}
                    </Label>

                    <div className="relative inline-flex items-center justify-center">
                        <input
                            type="checkbox"
                            ref={ref}
                            id={props.id || props.name}
                            aria-invalid={!!error}
                            className={`
                                peer
                                h-5 w-5 
                                appearance-none 
                                border border-border bg-secondary 
                                rounded
                                cursor-pointer
                                checked:bg-primary 
                                focus:outline-none focus:ring-2 focus:ring-ring
                                ${error ? "border-destructive focus:ring-destructive" : ""}
                                ${className}
                            `}
                            {...props}
                        />
                        <CheckIcon className="h-4 w-4 text-primary-foreground absolute pointer-events-none hidden peer-checked:block" />
                    </div>
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
