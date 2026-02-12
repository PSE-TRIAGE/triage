import {useForm} from "react-hook-form";

import {InputGroup} from "@/components/form/InputGroup";
import {Button} from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {LoadingButton} from "@/components/ui/LoadingButton";
import {useAdminCreateUser} from "@/hooks/mutations/useAdminMutations";
import {UserPlus} from "lucide-react";

interface CreateUserValues {
	username: string;
	password: string;
}

interface CreateUserModalProps {
	open: boolean;
	handleClose: () => void;
}

export function CreateUserModal({open, handleClose}: CreateUserModalProps) {
	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px] bg-card">
				<DialogHeader>
					<DialogTitle>Create New User</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Set up a new user account with a username and password.
					</DialogDescription>
				</DialogHeader>

				<CreationForm handleClose={handleClose} />
			</DialogContent>
		</Dialog>
	);
}

function CreationForm({handleClose}: {handleClose: () => void}) {
	const {
		register,
		handleSubmit,
		formState: {errors, isSubmitting},
		reset,
	} = useForm<CreateUserValues>();

	const createUserMutation = useAdminCreateUser();

	const onSubmit = async (data: CreateUserValues) => {
		try {
			await createUserMutation.mutateAsync(data);
			reset();
			handleClose();
		} catch {
			// Error is handled by the mutation's onError
		}
	};

	const isLoading = isSubmitting || createUserMutation.isPending;

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="space-y-6 py-4">
				<InputGroup
					label="Username"
					placeholder="e.g., john_doe"
					disabled={isLoading}
					showRequired={true}
					error={errors.username?.message}
					{...register("username", {
						required: "Username is required",
						minLength: {
							value: 3,
							message: "Username must be at least 3 characters",
						},
					})}
				/>

				<InputGroup
					label="Password"
					type="password"
					placeholder="Enter password"
					disabled={isLoading}
					showRequired={true}
					error={errors?.password?.message}
					{...register("password", {
						required: "Password is required",
						minLength: {
							value: 8,
							message: "Password must be at least 8 characters",
						},
					})}
				/>
			</div>

			<DialogFooter className="gap-2">
				<Button
					type="button"
					variant="outline"
					onClick={handleClose}
					disabled={isLoading}
					className="border-border"
				>
					Cancel
				</Button>
				<LoadingButton
					type="submit"
					disabled={isLoading}
					loading={isLoading}
					loadingText="Creating..."
					className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]"
				>
					<UserPlus className="h-4 w-4" />
					Create User
				</LoadingButton>
			</DialogFooter>
		</form>
	);
}
