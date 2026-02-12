import {useQuery} from "@tanstack/react-query";
import {queryKeys} from "@/lib/queryClient";
import {useServices} from "@/api/ServiceProvider";

export function useFormFields(projectId: number) {
    const {adminFormFieldService} = useServices();

    return useQuery({
        queryKey: queryKeys.formFields.byProject(projectId),
        queryFn: () => adminFormFieldService.listFormFields(projectId),
        enabled: !!localStorage.getItem("auth_token"),
        retry: 1,
    });
}
