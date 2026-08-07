"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { updateOrderStatus } from "@/actions/orders";
import { ORDER_STATUS, type OrderStatusKey } from "@/lib/catalogs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function OrderStatusSelect({
  orderId,
  estado,
  isAdmin,
}: {
  orderId: string;
  estado: OrderStatusKey;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("orderDetail");
  const tc = useTranslations("catalogs");
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(value: string) {
    setIsSaving(true);
    const result = await updateOrderStatus(orderId, value);
    setIsSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(
      t("statusUpdated", { status: tc(`orderStatus.${value}`).toLowerCase() })
    );
    router.refresh();
  }

  const options = Object.keys(ORDER_STATUS).filter((k) => k !== "CANCELADA" || isAdmin);

  return (
    <Select value={estado} onValueChange={handleChange} disabled={isSaving}>
      <SelectTrigger className="w-40" aria-label={t("orderStatusLabel")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((k) => (
          <SelectItem key={k} value={k}>
            {tc(`orderStatus.${k}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
