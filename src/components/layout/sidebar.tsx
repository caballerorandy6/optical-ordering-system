"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ClipboardList, Users, BarChart3, Settings, Glasses } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/ordenes", key: "orders", icon: ClipboardList },
  { href: "/clientes", key: "customers", icon: Users },
  { href: "/reportes", key: "reports", icon: BarChart3 },
  { href: "/config", key: "config", icon: Settings },
] as const;

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const items = NAV.filter((item) => item.href !== "/config" || isAdmin);

  return (
    <>
      {/* Sidebar en md+ */}
      <aside className="hidden w-56 shrink-0 border-r bg-sidebar md:flex md:flex-col">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <Glasses className="size-5 text-primary" aria-hidden />
          <span className="font-semibold">Óptica</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-2" aria-label={t("mainNavigation")}>
          {items.map(({ href, key, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-4" aria-hidden />
              {t(key)}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Barra inferior en móvil/tablet vertical */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background md:hidden"
        aria-label={t("mainNavigation")}
      >
        {items.map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
              pathname.startsWith(href) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" aria-hidden />
            {t(key)}
          </Link>
        ))}
      </nav>
    </>
  );
}
