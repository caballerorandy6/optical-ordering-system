"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { customerSchema, type CustomerInput } from "@/lib/validations";
import { createCustomer, updateCustomer } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  customerId?: string;
  defaultValues?: Partial<CustomerInput>;
};

export function CustomerForm({ customerId, defaultValues }: Props) {
  const router = useRouter();
  const t = useTranslations("customerForm");
  const tcommon = useTranslations("common");
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      telefono: "",
      celular: "",
      direccion: "",
      fechaNacimiento: "",
      notas: "",
      ...defaultValues,
    },
  });

  async function onSubmit(data: CustomerInput) {
    setIsSaving(true);
    const result = customerId
      ? await updateCustomer(customerId, data)
      : await createCustomer(data);
    setIsSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(customerId ? t("updated") : t("created"));
    router.push(`/clientes/${result.id}`);
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">{t("firstName")}</Label>
              <Input id="nombre" {...register("nombre")} />
              {errors.nombre && (
                <p className="text-sm text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">{t("lastName")}</Label>
              <Input id="apellido" {...register("apellido")} />
              {errors.apellido && (
                <p className="text-sm text-destructive">{errors.apellido.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">{t("phone")}</Label>
              <Input id="telefono" type="tel" {...register("telefono")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="celular">{t("cell")}</Label>
              <Input id="celular" type="tel" {...register("celular")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">{t("address")}</Label>
              <Input id="direccion" {...register("direccion")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento">{t("birthDate")}</Label>
              <Input id="fechaNacimiento" type="date" {...register("fechaNacimiento")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notas">{t("notes")}</Label>
            <Textarea id="notas" rows={3} {...register("notas")} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? tcommon("saving") : customerId ? t("saveChanges") : t("create")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {tcommon("cancel")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
