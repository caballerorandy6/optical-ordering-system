"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { orderSchema, type OrderInput } from "@/lib/validations";
import { createOrder } from "@/actions/orders";
import { formatUSD, toCents } from "@/lib/money";
import {
  LENS_TYPES,
  LENS_SUBTYPES,
  LENS_MATERIALS,
  LENS_TREATMENTS,
  LENS_COLOR_STYLES,
  FRAME_TYPES,
  CHARGE_CONCEPTS,
  PAYMENT_METHODS,
} from "@/lib/catalogs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// Los encabezados de la tabla Rx replican la hoja física (términos ópticos en inglés)
const RX_COLUMNS = [
  { key: "sphere", label: "Sphere" },
  { key: "cylinder", label: "Cylinder" },
  { key: "axis", label: "Axis" },
  { key: "prism", label: "Prism" },
  { key: "base", label: "Base" },
  { key: "far", label: "Far" },
  { key: "near", label: "Near" },
  { key: "add", label: "Add" },
  { key: "segHeight", label: "Seg.Ht" },
] as const;

const CL_COLUMNS = [
  { key: "bc", label: "B.C." },
  { key: "dia", label: "DIA" },
  { key: "power", label: "Power" },
  { key: "color", label: "Color" },
  { key: "marca", label: "Marca" },
] as const;

type CustomerOption = { id: string; label: string };

export function OrderForm({
  customers,
  preselectedCustomerId,
}: {
  customers: CustomerOption[];
  preselectedCustomerId?: string;
}) {
  const router = useRouter();
  const t = useTranslations("orderForm");
  const tc = useTranslations("catalogs");
  const tcommon = useTranslations("common");
  const [isSaving, setIsSaving] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerId: preselectedCustomerId ?? "",
      refCia: "",
      notas: "",
      instruccionesEspeciales: "",
      prescriptions: [
        { ojo: "OD", sphere: "", cylinder: "", axis: "", prism: "", base: "", far: "", near: "", add: "", segHeight: "" },
        { ojo: "OS", sphere: "", cylinder: "", axis: "", prism: "", base: "", far: "", near: "", add: "", segHeight: "" },
      ],
      lensConfig: {
        tipo: "SV",
        subtipo: "",
        material: undefined,
        estiloProgresivo: "",
        lensColor: "",
        colorStyle: undefined,
        tratamientos: [],
      },
      frame: {
        eyeSize: "",
        bridge: "",
        temple: "",
        vertical: "",
        ed: "",
        company: "",
        color: "",
        style: "",
        tipo: undefined,
        ownFrame: false,
        toCome: false,
        lensesOnly: false,
      },
      contactLenses: [
        { ojo: "OD", bc: "", dia: "", power: "", color: "", marca: "" },
        { ojo: "OS", bc: "", dia: "", power: "", color: "", marca: "" },
      ],
      charges: [{ concepto: "EXAM", descripcion: "", monto: "" }],
      deposito: "",
      depositoMetodo: undefined,
    },
  });

  const { fields: chargeFields, append, remove } = useFieldArray({ control, name: "charges" });

  // useWatch (no watch): compatible con React Compiler y re-renderiza al cambiar los campos
  const charges = useWatch({ control, name: "charges" });
  const deposito = useWatch({ control, name: "deposito" });
  const lensTipo = useWatch({ control, name: "lensConfig.tipo" }) ?? "SV";
  const selectedCustomerId = useWatch({ control, name: "customerId" });

  // Subtotal/total/balance calculados en vivo (misma lógica que el servidor).
  // Sin useMemo: la referencia del array puede no cambiar entre renders.
  let subtotalCents = 0;
  for (const c of charges ?? []) {
    const n = Number(c.monto);
    if (c.monto !== "" && Number.isFinite(n)) subtotalCents += toCents(n);
  }
  const depCents =
    deposito && Number.isFinite(Number(deposito)) ? toCents(Number(deposito)) : 0;
  const balanceCents = subtotalCents - depCents;

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => c.label.toLowerCase().includes(q));
  }, [customers, customerQuery]);

  async function onSubmit(data: OrderInput) {
    setIsSaving(true);
    const result = await createOrder(data);
    setIsSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("success"));
    router.push(`/ordenes/${result.id}`);
    router.refresh();
  }

  const inputCell = "h-9 px-2 text-center text-sm";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* ─── Cliente / header de la hoja ─── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("customerSection")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 md:col-span-2">
            <Label>{t("customerLabel")}</Label>
            <Input
              placeholder={t("customerFilter")}
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              aria-label={t("customerFilterAria")}
            />
            <Controller
              control={control}
              name="customerId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger aria-label={t("customerSelectAria")}>
                    <SelectValue placeholder={t("customerSelect")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCustomers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                    {filteredCustomers.length === 0 && (
                      <p className="p-2 text-sm text-muted-foreground">{t("noResults")}</p>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.customerId && (
              <p className="text-sm text-destructive">{errors.customerId.message}</p>
            )}
            {!selectedCustomerId && (
              <p className="text-xs text-muted-foreground">{t("newCustomerHint")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="refCia">{t("refCia")}</Label>
            <Input id="refCia" {...register("refCia")} />
          </div>
        </CardContent>
      </Card>

      {/* ─── Rx: tabla OD/OS como en la hoja ─── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("rxSection")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-190 border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-12 border bg-muted p-1 text-left"> </th>
                {RX_COLUMNS.map((col) => (
                  <th key={col.key} className="border bg-muted p-1 font-medium">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([0, 1] as const).map((idx) => (
                <tr key={idx}>
                  <td className="border bg-muted p-1 text-center font-semibold">
                    {idx === 0 ? "R" : "L"}
                  </td>
                  {RX_COLUMNS.map((col) => (
                    <td key={col.key} className="border p-0">
                      <Input
                        {...register(`prescriptions.${idx}.${col.key}` as const)}
                        className={`${inputCell} rounded-none border-0 shadow-none focus-visible:ring-1`}
                        aria-label={`${idx === 0 ? "OD" : "OS"} ${col.label}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {(() => {
            const rxErrors = [
              ...Object.values(errors.prescriptions?.[0] ?? {}),
              ...Object.values(errors.prescriptions?.[1] ?? {}),
            ] as Array<{ message?: string }>;
            const first = rxErrors.find((e) => e?.message);
            return first ? (
              <p className="mt-2 text-sm text-destructive">{first.message}</p>
            ) : null;
          })()}
        </CardContent>
      </Card>

      {/* ─── Lentes ─── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("lensesSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("lensType")}</Label>
              <Controller
                control={control}
                name="lensConfig.tipo"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      setValue("lensConfig.subtipo", "");
                    }}
                  >
                    <SelectTrigger aria-label={t("lensTypeAria")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(LENS_TYPES).map((k) => (
                        <SelectItem key={k} value={k}>
                          {tc(`lensTypes.${k}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {LENS_SUBTYPES[lensTipo]?.length > 0 && (
              <div className="space-y-2">
                <Label>{t("subtype")}</Label>
                <Controller
                  control={control}
                  name="lensConfig.subtipo"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger aria-label={t("subtypeAria")}>
                        <SelectValue placeholder={t("subtypeSelect")} />
                      </SelectTrigger>
                      <SelectContent>
                        {LENS_SUBTYPES[lensTipo].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
            {lensTipo === "PROGRESSIVE" && (
              <div className="space-y-2">
                <Label htmlFor="estiloProgresivo">{t("progressiveStyle")}</Label>
                <Input id="estiloProgresivo" {...register("lensConfig.estiloProgresivo")} />
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("material")}</Label>
              <Controller
                control={control}
                name="lensConfig.material"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger aria-label={t("materialAria")}>
                      <SelectValue placeholder={t("materialSelect")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(LENS_MATERIALS).map((k) => (
                        <SelectItem key={k} value={k}>
                          {tc(`materials.${k}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lensColor">{t("lensColor")}</Label>
              <div className="flex gap-2">
                <Input id="lensColor" {...register("lensConfig.lensColor")} />
                <Controller
                  control={control}
                  name="lensConfig.colorStyle"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="w-40" aria-label={t("colorStyleAria")}>
                        <SelectValue placeholder={t("colorStylePlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(LENS_COLOR_STYLES).map((k) => (
                          <SelectItem key={k} value={k}>
                            {tc(`colorStyles.${k}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("treatments")}</Label>
            <Controller
              control={control}
              name="lensConfig.tratamientos"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                  {Object.keys(LENS_TREATMENTS).map((k) => {
                    const checked = field.value?.includes(k as never) ?? false;
                    return (
                      <label
                        key={k}
                        className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm has-data-[state=checked]:border-primary"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => {
                            const set = new Set(field.value ?? []);
                            if (c) set.add(k as never);
                            else set.delete(k as never);
                            field.onChange([...set]);
                          }}
                        />
                        {tc(`treatments.${k}`)}
                      </label>
                    );
                  })}
                </div>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* ─── Montura ─── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("frameSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {(
              [
                ["eyeSize", t("frameEyeSize")],
                ["bridge", t("frameBridge")],
                ["temple", t("frameTemple")],
                ["vertical", t("frameVertical")],
                ["ed", t("frameEd")],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-1">
                <Label htmlFor={`frame-${key}`}>{label}</Label>
                <Input id={`frame-${key}`} {...register(`frame.${key}` as const)} />
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="frame-company">{t("frameCompany")}</Label>
              <Input id="frame-company" {...register("frame.company")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="frame-color">{t("frameColor")}</Label>
              <Input id="frame-color" {...register("frame.color")} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="frame-style">{t("frameStyle")}</Label>
              <Input id="frame-style" {...register("frame.style")} />
            </div>
          </div>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label>{t("frameType")}</Label>
              <Controller
                control={control}
                name="frame.tipo"
                render={({ field }) => (
                  <Select value={field.value ?? ""} onValueChange={field.onChange}>
                    <SelectTrigger className="w-44" aria-label={t("frameTypeAria")}>
                      <SelectValue placeholder={t("frameTypeSelect")} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(FRAME_TYPES).map((k) => (
                        <SelectItem key={k} value={k}>
                          {tc(`frameTypes.${k}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {(
              [
                ["ownFrame", t("ownFrame")],
                ["toCome", t("toCome")],
                ["lensesOnly", t("lensesOnly")],
              ] as const
            ).map(([key, label]) => (
              <Controller
                key={key}
                control={control}
                name={`frame.${key}` as const}
                render={({ field }) => (
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    {label}
                  </label>
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ─── Lentes de contacto ─── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("contactsSection")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-140 border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-12 border bg-muted p-1"> </th>
                {CL_COLUMNS.map((col) => (
                  <th key={col.key} className="border bg-muted p-1 font-medium">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([0, 1] as const).map((idx) => (
                <tr key={idx}>
                  <td className="border bg-muted p-1 text-center font-semibold">
                    {idx === 0 ? "OD" : "OS"}
                  </td>
                  {CL_COLUMNS.map((col) => (
                    <td key={col.key} className="border p-0">
                      <Input
                        {...register(`contactLenses.${idx}.${col.key}` as const)}
                        className={`${inputCell} rounded-none border-0 shadow-none focus-visible:ring-1`}
                        aria-label={`${idx === 0 ? "OD" : "OS"} ${col.label}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ─── Cargos + totales en vivo ─── */}
      <Card>
        <CardHeader>
          <CardTitle>{t("chargesSection")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {chargeFields.map((field, idx) => (
            <div key={field.id} className="flex flex-wrap items-start gap-2">
              <Controller
                control={control}
                name={`charges.${idx}.concepto`}
                render={({ field: f }) => (
                  <Select value={f.value} onValueChange={f.onChange}>
                    <SelectTrigger className="w-44" aria-label={t("conceptAria")}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(CHARGE_CONCEPTS).map((k) => (
                        <SelectItem key={k} value={k}>
                          {tc(`chargeConcepts.${k}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Input
                placeholder={t("chargeDescription")}
                className="min-w-40 flex-1"
                {...register(`charges.${idx}.descripcion` as const)}
              />
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  $
                </span>
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  className="w-28 pl-6 text-right"
                  aria-label={t("chargeAmountAria")}
                  {...register(`charges.${idx}.monto` as const)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(idx)}
                disabled={chargeFields.length === 1}
                aria-label={t("removeLine")}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
              {errors.charges?.[idx]?.monto && (
                <p className="w-full text-sm text-destructive">
                  {errors.charges[idx]?.monto?.message}
                </p>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ concepto: "OTRO", descripcion: "", monto: "" })}
          >
            <Plus className="size-4" aria-hidden /> {t("addLine")}
          </Button>
          {errors.charges?.root && (
            <p className="text-sm text-destructive">{errors.charges.root.message}</p>
          )}
          {typeof errors.charges?.message === "string" && (
            <p className="text-sm text-destructive">{errors.charges.message}</p>
          )}

          <Separator />

          <div className="ml-auto w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{tcommon("subtotal")}</span>
              <span className="font-medium">{formatUSD(subtotalCents)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="font-medium">{tcommon("total")}</span>
              <span className="font-semibold">{formatUSD(subtotalCents)}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{t("deposit")}</span>
              <div className="relative">
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  inputMode="decimal"
                  placeholder="0.00"
                  className="w-28 pl-6 text-right"
                  aria-label={t("depositAria")}
                  {...register("deposito")}
                />
              </div>
            </div>
            {Number(deposito || 0) > 0 && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{t("depositMethod")}</span>
                <Controller
                  control={control}
                  name="depositoMetodo"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="w-36" aria-label={t("depositMethodAria")}>
                        <SelectValue placeholder={t("depositMethodPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(PAYMENT_METHODS).map((k) => (
                          <SelectItem key={k} value={k}>
                            {tc(`paymentMethods.${k}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
            {errors.deposito && (
              <p className="text-sm text-destructive">{errors.deposito.message}</p>
            )}
            {errors.depositoMetodo && (
              <p className="text-sm text-destructive">{errors.depositoMetodo.message}</p>
            )}
            <Separator />
            <div className="flex justify-between text-base">
              <span className="font-semibold">{t("balanceDue")}</span>
              <span
                className={`font-bold ${balanceCents > 0 ? "text-destructive" : "text-emerald-600"}`}
              >
                {formatUSD(balanceCents)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─── Notas e instrucciones ─── */}
      <Card>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="notas">{t("notes")}</Label>
            <Textarea id="notas" rows={3} {...register("notas")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instrucciones">{t("specialInstructions")}</Label>
            <Textarea id="instrucciones" rows={3} {...register("instruccionesEspeciales")} />
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-16 z-30 flex justify-end gap-2 rounded-md border bg-background/95 p-3 backdrop-blur md:bottom-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tcommon("cancel")}
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
