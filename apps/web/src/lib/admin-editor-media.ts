import type { Locale } from "@/i18n/routing";
import { apiPostFormData } from "@/lib/api";

export async function uploadAdminEditorImage(
  file: File,
  locale: Locale,
  token: string,
): Promise<string> {
  const body = new FormData();
  body.append("file", file, file.name);
  const res = await apiPostFormData<{ data: { url: string } }>(
    "/api/v1/admin/media/upload",
    body,
    locale,
    token,
  );
  return res.data.url;
}
