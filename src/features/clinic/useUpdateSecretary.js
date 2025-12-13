import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSecretary } from "../../services/apiAuth";
import toast from "react-hot-toast";

export default function useUpdateSecretary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateSecretary,
        onSuccess: () => {
            toast.success("تم تحديث بيانات السكرتير بنجاح");
            // Invalidate relevant queries to refetch updated data
            queryClient.invalidateQueries(["clinicSecretaries"]);
        },
        onError: (error) => {
            toast.error("حدث خطأ أثناء تحديث بيانات السكرتير: " + error.message);
        }
    });
}