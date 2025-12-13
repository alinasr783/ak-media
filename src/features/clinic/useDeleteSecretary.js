import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteSecretary } from "../../services/apiAuth";
import toast from "react-hot-toast";

export default function useDeleteSecretary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSecretary,
        onSuccess: () => {
            toast.success("تم حذف السكرتير بنجاح");
            // Invalidate relevant queries to refetch updated data
            queryClient.invalidateQueries(["clinicSecretaries"]);
        },
        onError: (error) => {
            toast.error("حدث خطأ أثناء حذف السكرتير: " + error.message);
        }
    });
}