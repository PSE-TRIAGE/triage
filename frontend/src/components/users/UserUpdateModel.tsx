import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { InputGroup } from "@/components/form/InputGroup";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useCreateProject } from "@/hooks/mutations/useProjectMutations";
import { UserPlus } from "lucide-react";

interface UserUpdateValues {
	username: string;
	password: string;
}

interface UserUpdateModelProps {
	open: boolean;
	handleClose: () => void;
}

export function UserUpdateModel({ open, handleClose }: UserUpdateModelProps) {
	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px] bg-card">
				<DialogHeader>
					<DialogTitle>Update User:</DialogTitle>
					<DialogDescription className="text-muted-foreground">
						Set up a new mutation testing project. You can only upload the
						mutations.xml file now. Later updates of the mutations.xml file are
						not possible.
					</DialogDescription>
				</DialogHeader>

				<CreationForm handleClose={handleClose} />
			</DialogContent>
		</Dialog>
	);
}

function CreationForm({ handleClose }: { handleClose: () => void }) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<UserUpdateValues>({
		defaultValues: {
			username: "penis",
		},
	});

	const createProjectMutation = useCreateProject();

	const onSubmit = async (data: UserUpdateValues) => {
		await new Promise<void>((resolve) => setTimeout(resolve, 1500));
		console.log("Form Values: ", data);

		toast.success("User was edited successfully!");
		handleClose();
	};

	const isLoading = isSubmitting || createProjectMutation.isPending;

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="space-y-6 py-4">
				<InputGroup
					label="Username"
					placeholder="e.g., Dr. Sarah Cheng"
					disabled={isLoading}
					showRequired={true}
					error={errors.username?.message}
					{...register("username", {
						required: "Username is required",
						minLength: {
							value: 3,
							message: "Names must consist of at least 3 characters",
						},
					})}
				/>

				<InputGroup
					label="Password"
					placeholder="New password..."
					disabled={isLoading}
					showRequired={true}
					error={errors?.password?.message}
					{...register("password", {
						required: "Password is required",
						minLength: {
							value: 8,
							message: "Passwords must consist of at least 8 characters",
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
