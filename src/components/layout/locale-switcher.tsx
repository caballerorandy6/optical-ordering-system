"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { setLocale } from "@/actions/locale";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: "es" | "en") {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Idioma / Language">
      {(["es", "en"] as const).map((l) => (
        <Button
          key={l}
          variant={locale === l ? "secondary" : "ghost"}
          size="sm"
          className="px-2 text-xs font-semibold uppercase"
          disabled={isPending}
          onClick={() => switchTo(l)}
        >
          {l}
        </Button>
      ))}
    </div>
  );
}
