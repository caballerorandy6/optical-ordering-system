import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export const LOCALES = ["en", "es"] as const;
export const DEFAULT_LOCALE = "en"; // English is the primary language

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get("locale")?.value;
  const locale = cookieLocale === "es" ? "es" : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
