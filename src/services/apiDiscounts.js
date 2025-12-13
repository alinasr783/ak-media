import supabase from "./supabase";

/**
 * Search for a discount code in the discounts table
 * @param {string} code - The discount code to search for
 * @returns {Promise<Object|null>} - Discount object or null if not found
 */
export async function getDiscountByCode(code) {
    const { data, error } = await supabase
        .from("discounts")
        .select("id, code, value, is_percentage, is_active")
        .eq("code", code.trim().toUpperCase())
        .maybeSingle();

    if (error) {
        console.error("Error fetching discount:", error);
        throw error;
    }

    return data;
}

/**
 * Validate and calculate discount amount
 * @param {Object} discount - Discount object from DB
 * @param {number} originalAmount - Original price amount
 * @returns {Object} - { isValid, discountAmount, finalAmount, message }
 */
export function calculateDiscount(discount, originalAmount) {
    if (!discount) {
        return {
            isValid: false,
            discountAmount: 0,
            finalAmount: originalAmount,
            message: "الكود المدخل غير صحيح",
        };
    }

    // Check if discount is active
    if (!discount.is_active) {
        return {
            isValid: false,
            discountAmount: 0,
            finalAmount: originalAmount,
            message: "هذا الكود منتهي الصلاحية أو غير متاح",
        };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.is_percentage) {
        discountAmount = (originalAmount * discount.value) / 100;
    } else {
        discountAmount = discount.value;
    }

    // Ensure discount doesn't exceed original amount
    discountAmount = Math.min(discountAmount, originalAmount);
    const finalAmount = originalAmount - discountAmount;

    return {
        isValid: true,
        discountAmount,
        finalAmount,
        message: "تم تطبيق الخصم بنجاح",
        discount,
    };
}
