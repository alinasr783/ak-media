import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSecretary } from "../../services/apiAuth";
import toast from "react-hot-toast";

export default function useAddSecretary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addSecretary,
        onSuccess: () => {
            toast.success("تمت إضافة السكرتير بنجاح");
            // Invalidate relevant queries to refetch updated data
            queryClient.invalidateQueries(["clinicSecretaries"]);
        },
        onError: (error) => {
            toast.error("حدث خطأ أثناء إضافة السكرتير: " + error.message);
        }
    });
}