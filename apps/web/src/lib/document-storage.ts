import { createSupabaseClient } from "@veedu/api";

const BUCKET = "documents";
const SIGNED_URL_TTL_SEC = 60 * 60;

export function documentObjectPath(
  householdId: string,
  documentId: string,
  fileName: string,
): string {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `households/${householdId}/documents/${documentId}/${safe}`;
}

export async function uploadDocumentFile(input: {
  householdId: string;
  documentId: string;
  file: File;
}): Promise<{ file_path: string; file_name: string; mime_type: string }> {
  const client = createSupabaseClient();
  if (!client) throw new Error("Supabase not configured");

  const file_path = documentObjectPath(
    input.householdId,
    input.documentId,
    input.file.name,
  );
  const { error } = await client.storage
    .from(BUCKET)
    .upload(file_path, input.file, {
      upsert: true,
      contentType: input.file.type || "application/octet-stream",
    });
  if (error) throw error;

  return {
    file_path,
    file_name: input.file.name,
    mime_type: input.file.type || "application/octet-stream",
  };
}

export async function getDocumentSignedUrl(
  filePath: string | null | undefined,
): Promise<string | null> {
  if (!filePath) return null;
  const client = createSupabaseClient();
  if (!client) return null;

  const { data, error } = await client.storage
    .from(BUCKET)
    .createSignedUrl(filePath, SIGNED_URL_TTL_SEC);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteDocumentFile(
  filePath: string | null | undefined,
): Promise<void> {
  if (!filePath) return;
  const client = createSupabaseClient();
  if (!client) return;
  const { error } = await client.storage.from(BUCKET).remove([filePath]);
  if (error) throw error;
}
