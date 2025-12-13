/**
 * Generates a unique clinic ID as a UUID
 * This ensures compatibility with UUID type in the database
 * @returns {string} A unique clinic ID as UUID
 */
export function generateClinicId() {
    // Generate a random UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}