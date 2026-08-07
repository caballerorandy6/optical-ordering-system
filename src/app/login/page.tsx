import type { Metadata } from "next";
import { Glasses } from "lucide-react";
import { LoginForm } from "@/app/login/login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Glasses className="size-6" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Sistema de Órdenes</h1>
          <p className="text-sm text-muted-foreground">
            Inicia sesión con tu cuenta del personal
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
