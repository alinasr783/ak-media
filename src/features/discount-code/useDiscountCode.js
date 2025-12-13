import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { getDiscountByCode, calculateDiscount } from "../../services/apiDiscounts";

/**
 * Custom hook to manage discount code logic
 * @returns {Object} - { code, appliedDiscount, discountAmount, finalAmount, message, error, isPending, applyDiscount, clearDiscount }
 */
export default function useDiscountCode(originalAmount = 0) {
    const [code, setCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [finalAmount, setFinalAmount] = useState(originalAmount);
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);

    const { mutate, isPending } = useMutation({
        mutationFn: async (discountCode) => {
            const trimmedCode = discountCode.trim().toUpperCase();
            if (!trimmedCode) {
                throw new Error("يرجى إدخال كود الخصم");
            }

            const discount = await getDiscountByCode(trimmedCode);
            return discount;
        },
        onSuccess: (discount) => {
            const result = calculateDiscount(discount, originalAmount);

            if (result.isValid) {
                setAppliedDiscount(result.discount);
                setDiscountAmount(result.discountAmount);
                setFinalAmount(result.finalAmount);
                setMessage(result.message);
                setError(null);
            } else {
                setAppliedDiscount(null);
                setDiscountAmount(0);
                setFinalAmount(originalAmount);
                setMessage(result.message);
                setError(result.message);
            }
        },
        onError: (err) => {
            const errorMsg = "حدث خطأ في التحقق من الكود";
            setAppliedDiscount(null);
            setDiscountAmount(0);
            setFinalAmount(originalAmount);
            setMessage(errorMsg);
            setError(errorMsg);
            console.error("Discount error:", err);
        },
    });

    const applyDiscount = (discountCode) => {
        setCode(discountCode);
        mutate(discountCode);
    };

    const clearDiscount = () => {
        setCode("");
        setAppliedDiscount(null);
        setDiscountAmount(0);
        setFinalAmount(originalAmount);
        setMessage("");
        setError(null);
    };

    return {
        code,
        appliedDiscount,
        discountAmount,
        finalAmount,
        message,
        error,
        isPending,
        applyDiscount,
        clearDiscount,
    };
}
