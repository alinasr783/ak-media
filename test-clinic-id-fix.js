import { generateClinicId } from "./src/lib/clinicIdGenerator.js";

console.log("Testing clinic ID generation...");
const clinicId = generateClinicId();
console.log("Generated clinic ID:", clinicId);
console.log("Type of clinic ID:", typeof clinicId);
console.log("Is valid UUID format:", /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clinicId));