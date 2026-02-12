import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type {AdminUser} from "@/api/services/admin-users.service";
import {useAdminEnableUser} from "@/hooks/mutations/useAdminMutations";

type ReactivateUserDialogProps = {
    user: AdminUser;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function ReactivateUser({
    user,
    open,
    onOpenChange,
}: ReactivateUserDialogProps) {
    const enableUserMutation = useAdminEnableUser();

    const handleReactivate = async () => {
        await enableUserMutation.mutateAsync(user.id);
        onOpenChange(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-card">
                <AlertDialogHeader>
                    <AlertDialogTitle>Reactivate this user?</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="text-muted-foreground">
                            This will restore access for{" "}
                            <span className="font-medium text-foreground">
                                {user.username || "this user"}
                            </span>{" "}
                            and allow them to sign in again.
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer border-border hover:bg-secondary-foreground">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleReactivate}
                        disabled={enableUserMutation.isPending}
                        className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/80"
                    >
                        {enableUserMutation.isPending
                            ? "Reactivating..."
                            : "Yes, reactivate user"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
