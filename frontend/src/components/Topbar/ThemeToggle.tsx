import {Moon, Sun} from "lucide-react";

import {useTheme} from "@/components/utils/theme-provider";
import {Switch} from "@/components/ui/switch";
import {useId} from "react";
import {Label} from "@/components/ui/label";

export function ThemeToggle() {
    const {theme, setTheme} = useTheme();
    const switchId = useId();
    const isDarkMode = theme === "dark";

    return (
        <Label
            htmlFor={switchId}
            className="flex items-center justify-between w-full cursor-pointer"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setTheme(isDarkMode ? "light" : "dark");
            }}
        >
            <div className="flex items-center justify-center gap-4">
                {isDarkMode ? (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <Sun className="h-4 w-4 text-muted-foreground" />
                )}
                <p className="font-normal">Dark mode</p>
            </div>
            <Switch
                id={switchId}
                checked={isDarkMode}
                className="cursor-pointer"
                aria-label="dark mode toggle"
            />
        </Label>
    );
}
