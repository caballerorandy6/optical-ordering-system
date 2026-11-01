import { getTranslations } from "next-intl/server";
import { isDemoReadOnly } from "@/lib/demo";
import { requireUser } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [user, t] = await Promise.all([requireUser(), getTranslations("common")]);

  return (
    <div className="flex min-h-dvh">
      <Sidebar isAdmin={user.role === "ADMIN"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-2 border-b px-4">
          <LocaleSwitcher />
          <UserMenu name={user.name} role={user.role ?? "STAFF"} />
        </header>
        {isDemoReadOnly() && (
          <p role="status" className="border-b bg-muted px-4 py-2 text-center text-sm">
            {t("demoReadOnly")}
          </p>
        )}
        <main className="flex-1 p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </div>
    </div>
  );
}
