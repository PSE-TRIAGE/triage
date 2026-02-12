import {useForm} from "react-hook-form";

import {InputGroup} from "@/components/form/InputGroup";
import {Card} from "@/components/ui/card";
import {LoadingButton} from "@/components/ui/LoadingButton";
import {useLogin} from "@/hooks/mutations/useAuthMutations";
import {ApiError} from "@/api/client";

type LoginFormValues = {
    username: string;
    password: string;
};

export function Login() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 sm:p-6 md:p-10 lg:p-20">
            <Card className="flex flex-col md:flex-row justify-between w-full max-w-[1320px] h-fit shadow-xl overflow-hidden">
                <LoginForm />

                <div className="w-full md:w-1/2 bg-muted md:-my-6 h-48 sm:h-64 md:h-auto">
                    <img
                        src="/LoginImage.jpg"
                        alt="Login Page"
                        className="h-full w-full object-cover"
                    />
                </div>
            </Card>
        </div>
    );
}

function LoginForm() {
    const {
        register,
        handleSubmit,
        formState: {errors},
        resetField,
    } = useForm<LoginFormValues>();

    const loginMutation = useLogin();

    const onSubmit = async (data: LoginFormValues) => {
        loginMutation.mutate(data, {
            onError: () => {
                resetField("password");
            },
        });
    };

    const getErrorMessage = () => {
        if (!loginMutation.isError) return null;

        const error = loginMutation.error;
        if (error instanceof ApiError) {
            if (error.status === 401) {
                return "Invalid username or password";
            }
            if (error.status === 500) {
                return "Server error, please try again later";
            }
        }
        return "Login failed. Please try again.";
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col justify-between p-6 sm:p-8 w-full md:w-1/2"
            noValidate
        >
            <div className="flex flex-col gap-2">
                <header className="space-y-4">
                    <p className="text-muted-foreground text-lg flex items-center gap-2">
                        Welcome to Triage! <span>👋</span>
                    </p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-card-foreground">
                        Login to your <br /> account
                    </h1>
                </header>

                <div className="flex flex-col gap-4 mt-8">
                    <InputGroup
                        label="Username:"
                        placeholder="e.g. I ❤ Informatik"
                        autoComplete="username"
                        type="text"
                        error={errors.username?.message}
                        {...register("username", {
                            required: "please enter a valid username",
                        })}
                    />

                    <InputGroup
                        label="Password:"
                        placeholder="e.g. BadPassword123"
                        type="password"
                        autoComplete="current-password"
                        error={errors.password?.message}
                        {...register("password", {
                            required: "please enter a valid password",
                        })}
                    />

                    {loginMutation.isError && (
                        <p className="text-sm text-red-500 font-medium">
                            {getErrorMessage()}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-4 mt-8">
                <LoadingButton
                    type="submit"
                    disabled={loginMutation.isPending}
                    loading={loginMutation.isPending}
                    loadingText="Loggin in.."
                    className="text-primary-foreground font-semibold w-full md:w-32"
                >
                    Login
                </LoadingButton>
                <p className="text-muted-foreground text-xs">
                    Praxis der Softwareentwicklungs project • KIT
                </p>
            </div>
        </form>
    );
}
