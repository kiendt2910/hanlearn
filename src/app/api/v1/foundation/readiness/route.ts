import { requireAuthenticatedUser } from "@/lib/auth/session";
import { apiOk, handleApiError } from "@/lib/validation/api";
import { computeFoundationReadiness } from "@/modules/foundation/adaptive.service";

export async function GET() {
  try {
    const user = await requireAuthenticatedUser();
    const readiness = await computeFoundationReadiness(user.id);
    return apiOk(readiness);
  } catch (error) {
    return handleApiError(error);
  }
}
