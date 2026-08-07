"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const DEMO_ACCOUNTS = [
  { labelKey: "demoAdmin", email: "admin@optica.local", password: "Admin123!" },
  { labelKey: "demoStaff", email: "maria@optica.local", password: "Staff123!" },
] as const;

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations("login");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function doSignIn(emailValue: string, passwordValue: string) {
    setIsLoading(true);
    const { error } = await signIn.email({ email: emailValue, password: passwordValue });
    setIsLoading(false);
    if (error) {
      toast.error(t("invalidCredentials"));
      return;
    }
    router.push("/ordenes");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void doSignIn(email, password);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@optica.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t("signingIn") : t("signIn")}
          </Button>
        </form>

        <Separator className="my-4" />

        <div className="space-y-2">
          <p className="text-center text-xs font-medium text-muted-foreground">
            {t("demoTitle")}
          </p>
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              type="button"
              disabled={isLoading}
              onClick={() => {
                setEmail(acc.email);
                setPassword(acc.password);
                void doSignIn(acc.email, acc.password);
              }}
              className="w-full rounded-md border p-2 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50"
            >
              <span className="font-medium">{t(acc.labelKey)}</span>
              <span className="block text-xs text-muted-foreground">
                {acc.email} · {acc.password}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
