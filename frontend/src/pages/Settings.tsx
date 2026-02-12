import {DeactivateAccount} from "@/components/settings/DeactivateAccount";
import {ProfileDataManagement} from "@/components/settings/ProfileDataManagement";
import {Separator} from "@radix-ui/react-menu";

export function Settings() {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex flex-col gap-5 max-w-6xl mx-auto my-8">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-4xl font-bold text-foreground">
                        Account Settings
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your account information and preferences
                    </p>
                    <Separator className="border border-border" />
                </div>

                <div className="flex flex-col gap-10">
                    <ProfileDataManagement />

                    <DeactivateAccount />
                </div>
            </div>
        </div>
    );
}
