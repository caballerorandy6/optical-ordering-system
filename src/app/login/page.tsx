import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Glasses } from "lucide-react";
import { LoginForm } from "@/app/login/login-form";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default async function LoginPage() {
  const t = await getTranslations("login");

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <div className="absolute right-4 top-4">
        <LocaleSwitcher />
      </div>
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Glasses className="size-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
