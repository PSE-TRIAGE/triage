import {Toaster as Sonner} from "sonner";

export function Toaster() {
    return (
        <Sonner
            className="toaster group"
            position="bottom-right"
            toastOptions={{
                classNames: {
                    toast: "group toast group-[.toaster]:!bg-card group-[.toaster]:!text-card-foreground group-[.toaster]:!border-border group-[.toaster]:shadow-lg",

                    success:
                        "group-[.toaster]:!border-success group-[.toaster]:!text-success",

                    error: "group-[.toaster]:!border-destructive group-[.toaster]:!text-destructive",
                },
            }}
        />
    );
}
