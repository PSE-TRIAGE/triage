import {LoaderCircle} from "lucide-react";
import React from "react";

import {Button} from "@/components/ui/button.js";

export interface LoadingButtonProps extends React.ComponentProps<"button"> {
    children?: React.ReactNode;
    loading?: boolean;
    icon?: React.ReactElement;
    loadingText?: string;
    disabled?: boolean;
    ref?: React.Ref<HTMLButtonElement>;

    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const LoadingButton = ({
    icon,
    loading = false,
    loadingText,
    children,
    disabled,
    ref,
    ...props
}: LoadingButtonProps) => {
    return (
        <Button ref={ref} disabled={loading || disabled} {...props}>
            {loading ? (
                <>
                    <LoaderCircle
                        className="w-4 h-4 animate-spin mr-2"
                        aria-hidden="true"
                    />
                    {loadingText}
                </>
            ) : (
                <>
                    {icon}
                    {children}
                </>
            )}
        </Button>
    );
};
LoadingButton.displayName = "LoadingButton";
