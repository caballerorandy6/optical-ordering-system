"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-xl font-semibold">{t("errorTitle")}</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message || t("errorGeneric")}
      </p>
      <Button onClick={reset}>{t("retry")}</Button>
    </div>
  );
}
