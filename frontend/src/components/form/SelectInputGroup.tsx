import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export interface SelectGroupProps {
    label: string;
    options?: string[];
    value?: string;
    onValueChange: (value: string) => void;
    labelClassName?: string;
    placeholder?: string;
    showRequired?: boolean;
    error?: string;
    disabled?: boolean;
}

export function SelectInputGroup({
    label,
    options = [],
    value,
    onValueChange,
    labelClassName = "",
    placeholder = "Select an option",
    showRequired = false,
    error,
    disabled = false,
}: SelectGroupProps) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <Label
                className={`text-card-foreground text-sm font-medium ${labelClassName}`}
            >
                {label}
                {showRequired && <span className="text-destructive"> *</span>}
            </Label>

            <Select
                value={value}
                onValueChange={onValueChange}
                disabled={disabled}
            >
                <SelectTrigger
                    className={`
                        w-full bg-secondary border border-border
                        rounded-lg px-4 py-3 h-auto
                        text-card-foreground focus:ring-ring
                        ${!value ? "text-muted-foreground" : ""}
                        ${error ? "border-destructive focus:ring-destructive" : ""}
                    `}
                    aria-label={label}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent
                    position="popper"
                    className="bg-background border-border"
                >
                    {options.map((option) => (
                        <SelectItem
                            key={option}
                            value={option}
                            className="hover:bg-secondary focus:bg-secondary cursor-pointer"
                        >
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {error && (
                <span className="text-sm text-destructive font-medium">
                    {error}
                </span>
            )}
        </div>
    );
}
