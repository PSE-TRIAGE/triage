import {forwardRef, useId, useState} from "react";
import {Label} from "../ui/label";
import {Upload} from "lucide-react";
import {Input} from "../ui/input";

export interface FileInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    description?: string;
    labelClassName?: string;
    showRequired?: boolean;
    error?: string;
}

export const FileInputGroup = forwardRef<HTMLInputElement, FileInputProps>(
    (
        {
            label,
            description,
            labelClassName = "",
            className = "",
            showRequired = false,
            error,
            ...props
        },
        ref,
    ) => {
        const uploadId = useId();
        const [selectedFile, setSelectedFile] = useState<File | null>(null);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            setSelectedFile(file);

            // Call original onChange handler (important for react-hook-form)
            if (props.onChange) {
                props.onChange(e);
            }
        };

        return (
            <div className="space-y-2">
                <Label
                    id={uploadId}
                    className="text-sm font-medium text-card-foreground"
                >
                    {label}
                    {showRequired && (
                        <span className="text-destructive"> *</span>
                    )}
                </Label>

                <Label
                    id={uploadId}
                    className={`
									 flex items-center justify-center px-4 py-4 border-2 border-dashed rounded-lg cursor-pointer  
                                    ${error ? "border-destructive bg-destructive/5" : "border-border hover:border-primary"}
                                    ${className}
								`}
                >
                    <div className="text-center flex items-center justify-center gap-2">
                        {selectedFile ? (
                            <span className="text-sm font-semibold text-card-foreground block">
                                {selectedFile.name}
                            </span>
                        ) : (
                            <>
                                <Upload
                                    className={`w-6 h-6 ${error ? "text-destructive" : "text-muted-foreground"}`}
                                />
                                <span className="text-sm text-muted-foreground">
                                    {description
                                        ? description
                                        : "Click to Upload File"}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Hidden File-Input, RHF register */}
                    <Input
                        {...props}
                        id={uploadId}
                        ref={ref}
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                    />
                </Label>

                {error && (
                    <p className="text-sm text-destructive font-medium">
                        {error}
                    </p>
                )}
            </div>
        );
    },
);
