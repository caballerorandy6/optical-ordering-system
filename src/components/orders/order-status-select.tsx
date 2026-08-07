"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(value: string) {
    setIsSaving(true);
    const result = await updateOrderStatus(orderId, value);
    setIsSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`Orden marcada como ${ORDER_STATUS[value as OrderStatusKey].toLowerCase()}`);
    router.refresh();
  }

  const options = Object.entries(ORDER_STATUS).filter(
    ([k]) => k !== "CANCELADA" || isAdmin
  );

  return (
    <Select value={estado} onValueChange={handleChange} disabled={isSaving}>
      <SelectTrigger className="w-40" aria-label="Estado de la orden">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map(([k, v]) => (
          <SelectItem key={k} value={k}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
