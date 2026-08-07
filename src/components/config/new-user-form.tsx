"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { newUserSchema, type NewUserInput } from "@/lib/validations";
import { createStaffUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewUserForm() {
  const router = useRouter();
  const t = useTranslations("config");
  const tnav = useTranslations("nav");
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NewUserInput>({
    resolver: zodResolver(newUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "STAFF" },
  });

  async function onSubmit(data: NewUserInput) {
    setIsSaving(true);
    const result = await createStaffUser(data);
    setIsSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("created"));
    reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="u-name">{t("name")}</Label>
        <Input id="u-name" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="u-email">{t("email")}</Label>
        <Input id="u-email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="u-pass">{t("password")}</Label>
        <Input id="u-pass" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label>{t("role")}</Label>
        <Select
          value={watch("role")}
          onValueChange={(v) => setValue("role", v as NewUserInput["role"])}
        >
          <SelectTrigger className="w-36" aria-label={t("roleAria")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STAFF">{tnav("roleStaff")}</SelectItem>
            <SelectItem value="ADMIN">{tnav("roleAdmin")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? t("creating") : t("create")}
      </Button>
    </form>
  );
}
