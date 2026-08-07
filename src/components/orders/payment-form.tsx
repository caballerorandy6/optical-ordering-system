"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addPayment } from "@/actions/payments";
import { PAYMENT_METHODS, type PaymentMethodKey } from "@/lib/catalogs";
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

export function PaymentForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState<PaymentMethodKey | "">("");
  const [nota, setNota] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!metodo) {
      toast.error("Selecciona el método de pago");
      return;
    }
    setIsSaving(true);
    const result = await addPayment({ orderId, monto, metodo, nota });
    setIsSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Abono registrado");
    setMonto("");
    setMetodo("");
    setNota("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div className="space-y-1">
        <Label htmlFor="abono-monto">Abono</Label>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            id="abono-monto"
            inputMode="decimal"
            placeholder="0.00"
            className="w-28 pl-6 text-right"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Método</Label>
        <Select value={metodo} onValueChange={(v) => setMetodo(v as PaymentMethodKey)}>
          <SelectTrigger className="w-36" aria-label="Método de pago">
            <SelectValue placeholder="Método..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="min-w-40 flex-1 space-y-1">
        <Label htmlFor="abono-nota">Nota</Label>
        <Input
          id="abono-nota"
          placeholder="Opcional"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? "Registrando..." : "Registrar abono"}
      </Button>
    </form>
  );
}
