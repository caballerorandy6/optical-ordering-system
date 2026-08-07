import { createElement, type ReactElement } from "react";
import { headers } from "next/headers";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { auth } from "@/lib/auth";
import { getOrderDetail } from "@/lib/queries";
import { OrderPdf } from "@/components/orders/order-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return new Response("No autorizado", { status: 401 });
  }

  const { id } = await params;
  const detail = await getOrderDetail(id);
  if (!detail) {
    return new Response("Orden no encontrada", { status: 404 });
  }

  const buffer = await renderToBuffer(
    createElement(OrderPdf, { detail }) as ReactElement<DocumentProps>
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="orden-${detail.order.folio}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
