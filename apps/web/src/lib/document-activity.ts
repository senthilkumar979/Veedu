import { createSupabaseClient } from "@veedu/api";
import type { DocumentActivityAction } from "@veedu/types";

export async function logDocumentActivity(input: {
  householdId: string;
  documentId: string;
  userId: string;
  action: DocumentActivityAction;
}): Promise<void> {
  const client = createSupabaseClient();
  if (!client) return;
  await client.from("document_activities").insert({
    household_id: input.householdId,
    document_id: input.documentId,
    user_id: input.userId,
    action: input.action,
  });
}
