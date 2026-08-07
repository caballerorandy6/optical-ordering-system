import type { Metadata } from "next";
import Link from "next/link";
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

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientesPage({
  searchParams,
}: PageProps<"/clientes">) {
  await requireUser();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const customers = await searchCustomers(query);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Button asChild>
          <Link href="/clientes/nuevo">
            <Plus className="size-4" aria-hidden /> Nuevo cliente
          </Link>
        </Button>
      </div>

      <CustomerSearch placeholder="Buscar por nombre o teléfono..." />

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Celular</TableHead>
              <TableHead className="hidden md:table-cell">Dirección</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  {query ? "Sin resultados para tu búsqueda" : "Aún no hay clientes"}
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
