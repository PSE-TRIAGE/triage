import {useForm} from "react-hook-form";

import {InputGroup} from "@/components/form/InputGroup";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {toast} from "sonner";
import {LoadingButton} from "@/components/ui/LoadingButton";
import {
    useChangePassword,
    useChangeUsername,
} from "@/hooks/mutations/useAuthMutations";
import {ApiError} from "@/api/client";
import {useMe} from "@/hooks/queries/useUserQueries";

export interface ProfileFormValues {
    username: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    avatar?: string;
}

export function ProfileDataManagement() {
    return (
        <div className="space-y-6">
            <UserNameCard />
            <PasswordCard />
        </div>
    );
}

function UserNameCard() {
    const {data: user} = useMe();
    const changeUsername = useChangeUsername();
    const {
        register,
        handleSubmit,
        reset,
        setError,
        watch,
        formState: {isSubmitting, errors},
    } = useForm<ProfileFormValues>({
        defaultValues: {username: user?.username},
    });

    const currentUsername = watch("username");
    const isUnchanged = currentUsername === user?.username;

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            await changeUsername.mutateAsync({
                new_username: data.username,
            });

            toast.success("Username successfully updated!");
            reset({username: data.username});
        } catch (error) {
            console.error("This error occurred during username update", error);

            if (!(error instanceof ApiError)) {
                return;
            }
            if (error?.status === 409) {
                setError("username", {
                    type: "manual",
                    message:
                        "A user with this name already exists. Please choose a different username.",
                });
            } else {
                toast.error("Failed to update username. Please try again.");
            }
        }
    };

    const isLoading = isSubmitting || changeUsername.isPending;
    const isDisabled = isLoading || isUnchanged;

    return (
        <Card className="border-none shadow-md bg-card">
            <CardHeader>
                <CardTitle className="text-card-foreground">
                    Profile Information
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Update your user name
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <InputGroup
                        label="This is your public-facing name:"
                        placeholder={"Your username..."}
                        error={errors.username?.message}
                        labelClassName="text-muted-foreground"
                        {...register("username", {
                            required: "please enter a valid name",
                            minLength: {
                                value: 3,
                                message:
                                    "Usernames must consist of at least 3 characters",
                            },
                            maxLength: {
                                value: 50,
                                message:
                                    "Usernames cannot exceed 50 characters",
                            },
                        })}
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                        <LoadingButton
                            type="submit"
                            loadingText="Saving..."
                            loading={isLoading}
                            disabled={isDisabled}
                            className="bg-green-600 hover:bg-green-700 text-white transition-all min-w-[140px]"
                        >
                            Save Changes
                        </LoadingButton>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function PasswordCard() {
    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: {isSubmitting, errors},
    } = useForm<ProfileFormValues>();

    const changePasswordRequest = useChangePassword();

    const onSubmit = async (data: ProfileFormValues) => {
        // Validate passwords match
        if (data.newPassword !== data.confirmNewPassword) {
            setError("confirmNewPassword", {
                type: "manual",
                message:
                    "Passwords do not match. Please ensure both password fields are identical.",
            });
            return;
        }

        try {
            await changePasswordRequest.mutateAsync({
                current_password: data.currentPassword,
                new_password: data.newPassword,
            });

            toast.success("Password successfully updated!");
            reset();
        } catch (error) {
            console.error("This error occurred during password update", error);
            toast.error("Failed to update password. Please try again.");
        }
    };

    const isLoading = isSubmitting || changePasswordRequest.isPending;

    return (
        <Card className="border-none shadow-md bg-card">
            <CardHeader>
                <CardTitle className="text-card-foreground">
                    Change Password
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                    Update your password to keep your account secure
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <InputGroup
                        label="CurrentPassword:"
                        placeholder={"Your current password..."}
                        error={errors.currentPassword?.message}
                        labelClassName="text-muted-foreground"
                        type="password"
                        {...register("currentPassword", {
                            required: "Please enter a valid password",
                            minLength: {
                                value: 1,
                                message:
                                    "Passwords must consist of at least 8 characters",
                            },
                        })}
                    />

                    <InputGroup
                        label="New password:"
                        placeholder={"Your new password..."}
                        error={errors.newPassword?.message}
                        labelClassName="text-muted-foreground"
                        type="password"
                        {...register("newPassword", {
                            required: "Please enter a valid password",
                            minLength: {
                                value: 8,
                                message:
                                    "Passwords must consist of at least 8 characters",
                            },
                        })}
                    />

                    <InputGroup
                        label="Confirm new password:"
                        placeholder={"Your new password again..."}
                        error={errors.confirmNewPassword?.message}
                        labelClassName="text-muted-foreground"
                        type="password"
                        {...register("confirmNewPassword", {
                            required: "Please enter a valid password",
                            minLength: {
                                value: 8,
                                message:
                                    "Passwords must consist of at least 8 characters",
                            },
                        })}
                    />

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                        <LoadingButton
                            type="submit"
                            loading={isLoading}
                            loadingText="Updating.."
                            disabled={isLoading}
                            className="bg-primary hover:bg-primary/70 text-white transition-all min-w-[140px]"
                        >
                            Update Password
                        </LoadingButton>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
