import {useState} from "react";
import {toast} from "sonner";

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
import {
    useAdminDeleteUser,
    useAdminDisableUser,
} from "@/hooks/mutations/useAdminMutations";
import {useMe} from "@/hooks/queries/useUserQueries";

type DeleteUserDialogProps = {
    user: AdminUser;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function DeleteUser({user, open, onOpenChange}: DeleteUserDialogProps) {
    const {data: currentUser} = useMe();
    const deleteUserMutation = useAdminDeleteUser();
    const disableUserMutation = useAdminDisableUser();
    const [shouldDeleteData, setShouldDeleteData] = useState(false);

    const isSelf = currentUser?.id === String(user.id);
    const isPending =
        deleteUserMutation.isPending || disableUserMutation.isPending;

    const handleDeleteAccount = async () => {
        if (isSelf) {
            toast.error(
                "You cannot deactivate or delete your own account. Please ask another admin to manage it for you.",
            );
            return;
        }
        if (shouldDeleteData) {
            await deleteUserMutation.mutateAsync(user.id);
            return;
        }
        await disableUserMutation.mutateAsync(user.id);
    };

    return (
        <AlertDialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    setShouldDeleteData(false);
                }
                onOpenChange(nextOpen);
            }}
        >
            <AlertDialogContent className="bg-card">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {shouldDeleteData
                            ? "Permanently delete user data?"
                            : "Deactivate this user?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="text-muted-foreground">
                            This will deactivate the account for{" "}
                            <span className="font-medium text-foreground">
                                {user.username || "this user"}
                            </span>{" "}
                            and sign them out. Their data will be retained
                            unless you choose to fully delete it.
                            <div className="mt-4 rounded-md border border-border bg-secondary/40 p-3">
                                <label className="flex items-start gap-3 text-sm text-foreground">
                                    <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 accent-destructive"
                                        checked={shouldDeleteData}
                                        onChange={(event) =>
                                            setShouldDeleteData(
                                                event.target.checked,
                                            )
                                        }
                                        disabled={isPending}
                                    />
                                    <span>
                                        Also fully delete user data?
                                        <span className="block text-xs text-muted-foreground mt-1">
                                            This permanently removes the user
                                            record and associated data.
                                        </span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer border-border hover:bg-secondary-foreground">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={isPending}
                        className="cursor-pointer bg-destructive hover:bg-destructive/70 text-destructive-foreground"
                    >
                        {isPending
                            ? shouldDeleteData
                                ? "Deleting..."
                                : "Deactivating..."
                            : shouldDeleteData
                              ? "Yes, delete user data"
                              : "Yes, deactivate user"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
