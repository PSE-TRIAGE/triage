import {useQuery} from "@tanstack/react-query";
import {useServices} from "@/api/ServiceProvider";
import {queryKeys} from "@/lib/queryClient";

export function useFormFields(projectId: number) {
    const {adminFormFieldService} = useServices();

    return useQuery({
        queryKey: queryKeys.formFields.byProject(projectId),
        queryFn: () => adminFormFieldService.listFormFields(projectId),
        enabled: !!localStorage.getItem("auth_token"),
        retry: 1,
    });
}
