import {AlertTriangle} from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {Button} from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {useDeactivateAccount} from "@/hooks/mutations/useAuthMutations";

export function DeactivateAccount() {
    const deactivateAccountRequest = useDeactivateAccount();

    const handleDeactivateAccount = async () => {
        await deactivateAccountRequest.mutateAsync();
    };
    return (
        <Card className="border-destructive">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <AlertTriangle
                        className="w-5 h-5 text-destructive"
                        aria-hidden="true"
                    />
                    <CardTitle className="text-destructive">
                        Danger Zone
                    </CardTitle>
                </div>
                <CardDescription>
                    Sensitive actions that affect your account access
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 bg-secondary rounded-lg border border-border">
                    <h3 className="text-secondary-foreground mb-2">
                        Deactivate Account
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Deactivating your account will sign you out and disable
                        future access. Your data will be retained unless an
                        admin fully deletes it later.
                    </p>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="bg-destructive hover:bg-destructive/70 text-destructive-foreground">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Deactivate this account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card">
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div>
                                        This will deactivate your account and
                                        sign you out. Your data will be kept on
                                        our servers unless an admin fully
                                        deletes it later. This includes:
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>All projects and mutants</li>
                                            <li>All reviews and ratings</li>
                                            <li>Your profile information</li>
                                            <li>All associated data</li>
                                        </ul>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer border-border hover:bg-secondary-foreground">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDeactivateAccount}
                                    disabled={deactivateAccountRequest.isPending}
                                    className="cursor-pointer bg-destructive hover:bg-destructive/70 text-destructive-foreground"
                                >
                                    {deactivateAccountRequest.isPending
                                        ? "Deactivating..."
                                        : "Yes, deactivate my account"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}
