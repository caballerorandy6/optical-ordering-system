import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { CustomerForm } from "@/components/customers/customer-form";

export const metadata: Metadata = { title: "Nuevo cliente" };

export default async function NuevoClientePage() {
  await requireUser();
  const t = await getTranslations("customers");
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">{t("new")}</h1>
      <CustomerForm />
    </div>
  );
}
