import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { searchCustomers } from "@/lib/queries";
import { CustomerSearch } from "@/components/customers/customer-search";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("customers") };
}

export default async function ClientesPage({ searchParams }: PageProps<"/clientes">) {
  await requireUser();
  const t = await getTranslations("customers");
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const customers = await searchCustomers(query);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <Button asChild>
          <Link href="/clientes/nuevo">
            <Plus className="size-4" aria-hidden /> {t("new")}
          </Link>
        </Button>
      </div>

      <CustomerSearch placeholder={t("searchPlaceholder")} />

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("phone")}</TableHead>
              <TableHead>{t("cell")}</TableHead>
              <TableHead className="hidden md:table-cell">{t("address")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {query ? t("emptySearch") : t("empty")}
                </TableCell>
              </TableRow>
            )}
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Link
                    href={`/clientes/${c.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {c.apellido}, {c.nombre}
                  </Link>
                </TableCell>
                <TableCell>{c.telefono ?? "—"}</TableCell>
                <TableCell>{c.celular ?? "—"}</TableCell>
                <TableCell className="hidden max-w-64 truncate md:table-cell">
                  {c.direccion ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
