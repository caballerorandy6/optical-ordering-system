import "server-only";

import { getTranslations } from "next-intl/server";
import { isDemoReadOnly } from "@/lib/demo";

/** First line of every Server Action that writes: the error to return in read-only mode, or null. */
export async function demoWriteBlocked(): Promise<{ ok: false; error: string } | null> {
  if (!isDemoReadOnly()) return null;
  const t = await getTranslations("common");
  return { ok: false, error: t("demoReadOnly") };
}
