import {Star} from "lucide-react";
import {useState} from "react";
import {Label} from "@/components/ui/label";
import {cn} from "@/lib/utils"; // Standard Shadcn Utility

export interface StarRatingGroupProps {
    label: string;
    value?: number;
    onValueChange: (value: number) => void;
    labelClassName?: string;
    showRequired?: boolean;
    error?: string;
    disabled?: boolean;
}

export function StarRatingInputGroup({
    label,
    value = 0,
    onValueChange,
    labelClassName = "",
    showRequired = false,
    error,
    disabled = false,
}: StarRatingGroupProps) {
    // State for Star-Hover-Effect
    const [hoverValue, setHoverValue] = useState<number | null>(null);

    const stars = 5;

    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Label Zeile */}
            <Label
                className={cn(
                    "text-card-foreground text-sm font-medium",
                    labelClassName,
                )}
            >
                {label}
                {showRequired && <span className="text-destructive"> *</span>}
            </Label>
            <div className="flex items-center gap-1">
                {Array.from({length: stars}).map((_, index) => {
                    const starValue = index + 1;
                    const isSelected = starValue <= value;
                    const isHovered =
                        hoverValue !== null && starValue <= hoverValue;
                    const isFilled = isHovered || isSelected;

                    return (
                        <button
                            key={`star-${starValue}`}
                            type="button" // imporatant: not to submit the form
                            disabled={disabled}
                            onClick={() => onValueChange(starValue)}
                            onMouseEnter={() =>
                                !disabled && setHoverValue(starValue)
                            }
                            onMouseLeave={() => setHoverValue(null)}
                            className={cn(
                                "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm p-0.5",
                                disabled
                                    ? "cursor-not-allowed opacity-50"
                                    : "cursor-pointer hover:scale-110 transition-transform",
                            )}
                        >
                            <Star
                                size={28}
                                className={cn(
                                    "transition-all",
                                    isFilled
                                        ? cn(
                                              "fill-[#ECA72C] text-[#ECA72C]",
                                              // Reduced opacity for hover preview
                                              isHovered &&
                                                  !isSelected &&
                                                  "opacity-60",
                                          )
                                        : "fill-transparent text-muted-foreground/40",
                                )}
                            />
                        </button>
                    );
                })}
            </div>

            {/* Text beneav stars: "Selected: 3 out of 5" */}
            <div className="text-sm text-muted-foreground font-medium">
                {value > 0 ? (
                    <span>
                        Selected: {value} out of {stars}
                    </span>
                ) : (
                    <span className={error && "text-destructive"}>
                        No rating selected.
                        {/* Error Message */}
                        {error && (
                            <span className="text-sm text-destructive font-medium">
                                {" "}
                                {error}
                            </span>
                        )}
                    </span>
                )}
            </div>
        </div>
    );
}
