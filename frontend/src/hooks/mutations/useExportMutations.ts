import {useMutation} from "@tanstack/react-query";
import {useServices} from "@/api/ServiceProvider";

export function useExportDownload() {
    const {exportService} = useServices();
    return useMutation({
        mutationFn: ({
            projectId,
            filename,
        }: {
            projectId: number;
            filename: string;
        }) => exportService.downloadExport(projectId, filename),
    });
}
