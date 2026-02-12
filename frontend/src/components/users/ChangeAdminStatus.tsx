import {Shield} from "lucide-react";

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
import type {AdminUser} from "@/api/services/admin-users.service";
import {useAdminChangeRole} from "@/hooks/mutations/useAdminMutations";

export function ChangeAdminStatus({user}: {user: AdminUser}) {
	const changeRoleMutation = useAdminChangeRole();
	const isPromoting = !user.isAdmin;

	const handleStatusChange = async () => {
		await changeRoleMutation.mutateAsync({
			userId: user.id,
			promote: isPromoting,
		});
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger
				onClick={(e) => e.stopPropagation()}
				className="flex items-center cursor-pointer w-full h-full"
			>
				<Shield className="h-4 w-4 mr-2" />
				{isPromoting ? "Make Admin" : "Remove Admin"}
			</AlertDialogTrigger>
			<AlertDialogContent className="bg-card">
				<AlertDialogHeader>
					<AlertDialogTitle>
						{isPromoting
							? "Grant admin privileges?"
							: "Revoke admin privileges?"}
					</AlertDialogTitle>
					<AlertDialogDescription className="text-muted-foreground">
						Are you sure you want to change the role for{" "}
						<span className="font-medium text-foreground">
							{user.username || "this user"}
						</span>
						?
						<br />
						<br />
						{isPromoting
							? "They will gain full access to administrative features, including managing projects and other users."
							: "They will lose access to all administrative features and will be demoted to a standard member."}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel className="cursor-pointer border-border hover:bg-secondary-foreground">
						Cancel
					</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleStatusChange}
						disabled={changeRoleMutation.isPending}
						className={`cursor-pointer ${
							!isPromoting
								? "bg-destructive hover:bg-destructive/70 text-destructive-foreground"
								: ""
						}`}
					>
						{changeRoleMutation.isPending
							? "Updating..."
							: isPromoting
								? "Yes, grant access"
								: "Yes, remove access"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
