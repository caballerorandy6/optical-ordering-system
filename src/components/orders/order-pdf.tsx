import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { formatUSD, toCents } from "@/lib/money";
import {
  LENS_TYPES,
  LENS_MATERIALS,
  LENS_TREATMENTS,
  FRAME_TYPES,
  CHARGE_CONCEPTS,
  PAYMENT_METHODS,
} from "@/lib/catalogs";
import { BUSINESS } from "@/lib/constants";
import type { getOrderDetail } from "@/lib/queries";

type Detail = NonNullable<Awaited<ReturnType<typeof getOrderDetail>>>;

const BLUE = "#1e3a8a";

const s = StyleSheet.create({
  page: { padding: 28, fontSize: 8.5, fontFamily: "Helvetica", color: "#1f2937" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  clinic: { color: BLUE },
  clinicName: { fontSize: 16, fontFamily: "Helvetica-Bold", color: BLUE },
  label: { color: BLUE, fontFamily: "Helvetica-Bold" },
  box: { borderWidth: 1, borderColor: BLUE, borderRadius: 4, padding: 6, marginBottom: 6 },
  row: { flexDirection: "row" },
  sectionTitle: {
    backgroundColor: BLUE,
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 8,
    marginBottom: 3,
  },
  table: { borderWidth: 0.5, borderColor: BLUE },
  tr: { flexDirection: "row" },
  th: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: BLUE,
    backgroundColor: "#eef2ff",
    padding: 2,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  td: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: BLUE,
    padding: 2,
    textAlign: "center",
    minHeight: 14,
  },
  eyeCell: {
    width: 18,
    borderWidth: 0.5,
    borderColor: BLUE,
    backgroundColor: "#eef2ff",
    padding: 2,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },
  chargeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 0.5,
    borderColor: BLUE,
    paddingVertical: 2.5,
    paddingHorizontal: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 3,
    fontFamily: "Helvetica-Bold",
  },
});

const RX_COLS = [
  ["sphere", "SPHERE"],
  ["cylinder", "CYLINDER"],
  ["axis", "AXIS"],
  ["prism", "PRISM"],
  ["base", "BASE"],
  ["far", "FAR"],
  ["near", "NEAR"],
  ["add", "ADD"],
  ["segHeight", "SEG.HT"],
] as const;

export function OrderPdf({ detail }: { detail: Detail }) {
  const { order, subtotalCents, totalCents, balanceCents } = detail;
  const od = order.prescriptions.find((p) => p.ojo === "OD");
  const os = order.prescriptions.find((p) => p.ojo === "OS");
  const clOd = order.contactLenses.find((c) => c.ojo === "OD");
  const clOs = order.contactLenses.find((c) => c.ojo === "OS");
  const depositCents = totalCents - balanceCents;
  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }).format(d);

  return (
    <Document title={`Order #${order.folio}`}>
      <Page size="LETTER" style={s.page}>
        {/* ─── Encabezado ─── */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.clinicName}>{BUSINESS.name.toUpperCase()}</Text>
            <Text style={s.clinic}>{BUSINESS.address}</Text>
            {BUSINESS.phone ? <Text style={s.clinic}>{BUSINESS.phone}</Text> : null}
          </View>
          <View>
            <Text>
              <Text style={s.label}>ORDER: </Text>#{order.folio}
            </Text>
            <Text>
              <Text style={s.label}>DATE: </Text>
              {fmtDate(order.fecha)}
            </Text>
            <Text>
              <Text style={s.label}>REF/CIA: </Text>
              {order.refCia ?? ""}
            </Text>
            <Text>
              <Text style={s.label}>SOLD BY: </Text>
              {order.user.name}
            </Text>
          </View>
        </View>

        {/* ─── Cliente ─── */}
        <View style={s.box}>
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <Text>
              <Text style={s.label}>NAME: </Text>
              {order.customer.nombre} {order.customer.apellido}
            </Text>
            <Text>
              <Text style={s.label}>D.O.B.: </Text>
              {order.customer.fechaNacimiento
                ? new Intl.DateTimeFormat("en-US", { timeZone: "UTC" }).format(
                    order.customer.fechaNacimiento
                  )
                : ""}
            </Text>
          </View>
          <View style={[s.row, { justifyContent: "space-between", marginTop: 2 }]}>
            <Text>
              <Text style={s.label}>PHONE: </Text>
              {order.customer.telefono ?? ""}
            </Text>
            <Text>
              <Text style={s.label}>CELL: </Text>
              {order.customer.celular ?? ""}
            </Text>
          </View>
          <Text style={{ marginTop: 2 }}>
            <Text style={s.label}>ADDRESS: </Text>
            {order.customer.direccion ?? ""}
          </Text>
        </View>

        {/* ─── Cuerpo: 2 columnas como la hoja ─── */}
        <View style={s.row}>
          {/* Columna izquierda */}
          <View style={{ flex: 2.2, marginRight: 6 }}>
            {/* Rx */}
            <Text style={s.sectionTitle}>RX</Text>
            <View style={[s.table, { marginBottom: 6 }]}>
              <View style={s.tr}>
                <Text style={s.eyeCell}> </Text>
                {RX_COLS.map(([k, label]) => (
                  <Text key={k} style={s.th}>
                    {label}
                  </Text>
                ))}
              </View>
              {[
                ["R", od],
                ["L", os],
              ].map(([eye, rx]) => (
                <View key={eye as string} style={s.tr}>
                  <Text style={s.eyeCell}>{eye as string}</Text>
                  {RX_COLS.map(([k]) => (
                    <Text key={k} style={s.td}>
                      {(rx as typeof od)?.[k] ?? ""}
                    </Text>
                  ))}
                </View>
              ))}
            </View>

            {/* Lentes */}
            <Text style={s.sectionTitle}>LENSES</Text>
            <View style={[s.box, { marginBottom: 6 }]}>
              {order.lensConfig ? (
                <>
                  <Text>
                    <Text style={s.label}>Tipo: </Text>
                    {LENS_TYPES[order.lensConfig.tipo]}
                    {order.lensConfig.subtipo ? ` — ${order.lensConfig.subtipo}` : ""}
                    {order.lensConfig.estiloProgresivo
                      ? ` (Style: ${order.lensConfig.estiloProgresivo})`
                      : ""}
                  </Text>
                  <Text>
                    <Text style={s.label}>Material: </Text>
                    {order.lensConfig.material
                      ? LENS_MATERIALS[order.lensConfig.material]
                      : "—"}
                  </Text>
                  <Text>
                    <Text style={s.label}>Lens color: </Text>
                    {order.lensConfig.lensColor ?? "—"}
                    {order.lensConfig.colorStyle === "GRADIENT" ? " (Gradient)" : ""}
                    {order.lensConfig.colorStyle === "SOLID" ? " (Solid)" : ""}
                  </Text>
                  <Text>
                    <Text style={s.label}>Tratamientos: </Text>
                    {order.lensConfig.tratamientos.length > 0
                      ? order.lensConfig.tratamientos
                          .map((t) => LENS_TREATMENTS[t])
                          .join(", ")
                      : "—"}
                  </Text>
                </>
              ) : (
                <Text>—</Text>
              )}
            </View>

            {/* Montura */}
            <Text style={s.sectionTitle}>FRAME</Text>
            <View style={[s.table, { marginBottom: 6 }]}>
              <View style={s.tr}>
                {["EYE SIZE", "BRIDGE", "TEMPLE", "VERTICAL", "E.D."].map((h) => (
                  <Text key={h} style={s.th}>
                    {h}
                  </Text>
                ))}
              </View>
              <View style={s.tr}>
                {[
                  order.frame?.eyeSize,
                  order.frame?.bridge,
                  order.frame?.temple,
                  order.frame?.vertical,
                  order.frame?.ed,
                ].map((v, i) => (
                  <Text key={i} style={s.td}>
                    {v ?? ""}
                  </Text>
                ))}
              </View>
              <View style={s.tr}>
                {["COMPANY", "COL", "STYLE", "TIPO", "FLAGS"].map((h) => (
                  <Text key={h} style={s.th}>
                    {h}
                  </Text>
                ))}
              </View>
              <View style={s.tr}>
                {[
                  order.frame?.company,
                  order.frame?.color,
                  order.frame?.style,
                  order.frame?.tipo ? FRAME_TYPES[order.frame.tipo] : "",
                  [
                    order.frame?.ownFrame && "Own frame",
                    order.frame?.toCome && "To come",
                    order.frame?.lensesOnly && "Lenses only",
                  ]
                    .filter(Boolean)
                    .join(", "),
                ].map((v, i) => (
                  <Text key={i} style={s.td}>
                    {v || ""}
                  </Text>
                ))}
              </View>
            </View>

            {/* Lentes de contacto */}
            <Text style={s.sectionTitle}>CONTACT LENSES</Text>
            <View style={[s.table, { marginBottom: 6 }]}>
              <View style={s.tr}>
                <Text style={s.eyeCell}> </Text>
                {["B.C.", "DIA", "POWER", "COLOR", "MARCA"].map((h) => (
                  <Text key={h} style={s.th}>
                    {h}
                  </Text>
                ))}
              </View>
              {[
                ["OD", clOd],
                ["OS", clOs],
              ].map(([eye, cl]) => (
                <View key={eye as string} style={s.tr}>
                  <Text style={s.eyeCell}>{eye as string}</Text>
                  {[
                    (cl as typeof clOd)?.bc,
                    (cl as typeof clOd)?.dia,
                    (cl as typeof clOd)?.power,
                    (cl as typeof clOd)?.color,
                    (cl as typeof clOd)?.marca,
                  ].map((v, i) => (
                    <Text key={i} style={s.td}>
                      {v ?? ""}
                    </Text>
                  ))}
                </View>
              ))}
            </View>

            {/* Notas */}
            <Text style={s.sectionTitle}>NOTES / SPECIAL INSTRUCTIONS</Text>
            <View style={[s.box, { minHeight: 40 }]}>
              {order.notas ? <Text>{order.notas}</Text> : null}
              {order.instruccionesEspeciales ? (
                <Text style={{ marginTop: 2 }}>{order.instruccionesEspeciales}</Text>
              ) : null}
            </View>
          </View>

          {/* Columna derecha: cargos */}
          <View style={{ flex: 1 }}>
            <Text style={s.sectionTitle}>CARGOS</Text>
            <View style={[s.table, { marginBottom: 6 }]}>
              {order.charges.map((c) => (
                <View key={c.id} style={s.chargeRow}>
                  <Text>
                    {CHARGE_CONCEPTS[c.concepto]}
                    {c.descripcion ? ` (${c.descripcion})` : ""}
                  </Text>
                  <Text>{formatUSD(toCents(c.monto.toString()))}</Text>
                </View>
              ))}
              <View style={s.chargeRow}>
                <Text style={s.label}>SUBTOTAL</Text>
                <Text>{formatUSD(subtotalCents)}</Text>
              </View>
              <View style={s.chargeRow}>
                <Text style={s.label}>TOTAL</Text>
                <Text>{formatUSD(totalCents)}</Text>
              </View>
              <View style={s.chargeRow}>
                <Text style={s.label}>DEPOSIT / PAGADO</Text>
                <Text>{formatUSD(depositCents)}</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={{ color: BLUE }}>BAL. DUE</Text>
                <Text>{formatUSD(balanceCents)}</Text>
              </View>
            </View>

            <Text style={s.sectionTitle}>PAGOS</Text>
            <View style={s.table}>
              {order.payments.length === 0 ? (
                <View style={s.chargeRow}>
                  <Text>Sin pagos</Text>
                </View>
              ) : (
                order.payments.map((p) => (
                  <View key={p.id} style={s.chargeRow}>
                    <Text>
                      {new Intl.DateTimeFormat("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                      }).format(p.fecha)}{" "}
                      {PAYMENT_METHODS[p.metodo]}
                    </Text>
                    <Text>{formatUSD(toCents(p.monto.toString()))}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>

        <Text style={{ marginTop: 10 }}>
          <Text style={s.label}>Sold By: </Text>
          {order.user.name}
        </Text>
      </Page>
    </Document>
  );
}
