import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTreatmentTemplate } from "../../services/apiTreatmentTemplates";
import toast from "react-hot-toast";

export default function useUpdateTreatmentTemplate() {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending } = useMutation({
        mutationFn: ({ id, payload }) => updateTreatmentTemplate(id, payload),
        onSuccess: () => {
            toast.success("تم تحديث خطة العلاج بنجاح");
            // Invalidate and refetch treatment templates
            queryClient.invalidateQueries({
                queryKey: ["treatmentTemplates"],
            });
        },
        onError: (error) => {
            console.error("Error updating treatment template:", error);
            toast.error("حدث خطأ أثناء تحديث خطة العلاج");
        },
    });

    return { mutateAsync, isPending };
}