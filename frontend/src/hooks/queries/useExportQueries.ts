import {useQuery} from "@tanstack/react-query";
import {useServices} from "@/api/ServiceProvider";
import {queryKeys} from "@/lib/queryClient";

export function useExportPreview(projectId: number) {
    const {exportService} = useServices();
    return useQuery({
        queryKey: queryKeys.export.preview(projectId),
        queryFn: () => exportService.getExportPreview(projectId),
        enabled: !!projectId && !!localStorage.getItem("auth_token"),
        retry: 1,
    });
}
