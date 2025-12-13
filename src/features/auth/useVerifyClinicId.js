import { useMutation } from "@tanstack/react-query"
import { verifyClinicId } from "../../services/apiAuth"

export default function useVerifyClinicId() {
    return useMutation({
        mutationFn: verifyClinicId,
    })
}
