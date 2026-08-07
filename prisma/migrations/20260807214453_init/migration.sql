-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ABIERTA', 'LISTA', 'ENTREGADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "Eye" AS ENUM ('OD', 'OS');

-- CreateEnum
CREATE TYPE "LensType" AS ENUM ('SV', 'BIFOCAL', 'TRIFOCAL', 'PROGRESSIVE');

-- CreateEnum
CREATE TYPE "LensMaterial" AS ENUM ('PLASTIC', 'GLASS', 'POLY', 'HI_INDEX', 'TRANSIT');

-- CreateEnum
CREATE TYPE "LensTreatment" AS ENUM ('AR_COAT', 'POLY_BLUE_AR', 'TINT', 'EDGE_DRILL', 'POLY_H_INDEX', 'TRANSITIONS');

-- CreateEnum
CREATE TYPE "LensColorStyle" AS ENUM ('GRADIENT', 'SOLID');

-- CreateEnum
CREATE TYPE "FrameType" AS ENUM ('METAL', 'ZYL', 'RIMLESS');

-- CreateEnum
CREATE TYPE "ChargeConcept" AS ENUM ('EXAM', 'LENSES', 'FRAME', 'CONTACT_LENSES', 'AR', 'TINT', 'EDGE_DRILL', 'TRANSITIONS', 'OTRO');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'VISA', 'MC', 'AMEX', 'DISCOVER', 'DEBIT');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" TEXT DEFAULT 'STAFF',
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "impersonatedBy" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "celular" TEXT,
    "direccion" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "folio" SERIAL NOT NULL,
    "customerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refCia" TEXT,
    "estado" "OrderStatus" NOT NULL DEFAULT 'ABIERTA',
    "notas" TEXT,
    "instruccionesEspeciales" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "ojo" "Eye" NOT NULL,
    "sphere" TEXT,
    "cylinder" TEXT,
    "axis" TEXT,
    "prism" TEXT,
    "base" TEXT,
    "far" TEXT,
    "near" TEXT,
    "add" TEXT,
    "segHeight" TEXT,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LensConfig" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "tipo" "LensType" NOT NULL,
    "subtipo" TEXT,
    "material" "LensMaterial",
    "estiloProgresivo" TEXT,
    "lensColor" TEXT,
    "colorStyle" "LensColorStyle",
    "tratamientos" "LensTreatment"[],

    CONSTRAINT "LensConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Frame" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "eyeSize" TEXT,
    "bridge" TEXT,
    "temple" TEXT,
    "vertical" TEXT,
    "ed" TEXT,
    "company" TEXT,
    "color" TEXT,
    "style" TEXT,
    "tipo" "FrameType",
    "ownFrame" BOOLEAN NOT NULL DEFAULT false,
    "toCome" BOOLEAN NOT NULL DEFAULT false,
    "lensesOnly" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Frame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactLens" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "ojo" "Eye" NOT NULL,
    "bc" TEXT,
    "dia" TEXT,
    "power" TEXT,
    "color" TEXT,
    "marca" TEXT,

    CONSTRAINT "ContactLens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChargeLine" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "concepto" "ChargeConcept" NOT NULL,
    "descripcion" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ChargeLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo" "PaymentMethod" NOT NULL,
    "userId" TEXT NOT NULL,
    "nota" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "Customer_nombre_apellido_idx" ON "Customer"("nombre", "apellido");

-- CreateIndex
CREATE INDEX "Customer_telefono_idx" ON "Customer"("telefono");

-- CreateIndex
CREATE INDEX "Customer_celular_idx" ON "Customer"("celular");

-- CreateIndex
CREATE UNIQUE INDEX "Order_folio_key" ON "Order"("folio");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_estado_idx" ON "Order"("estado");

-- CreateIndex
CREATE INDEX "Order_fecha_idx" ON "Order"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_orderId_ojo_key" ON "Prescription"("orderId", "ojo");

-- CreateIndex
CREATE UNIQUE INDEX "LensConfig_orderId_key" ON "LensConfig"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Frame_orderId_key" ON "Frame"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactLens_orderId_ojo_key" ON "ContactLens"("orderId", "ojo");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_fecha_idx" ON "Payment"("fecha");

-- CreateIndex
CREATE INDEX "AuditLog_entidad_entidadId_idx" ON "AuditLog"("entidad", "entidadId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LensConfig" ADD CONSTRAINT "LensConfig_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frame" ADD CONSTRAINT "Frame_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactLens" ADD CONSTRAINT "ContactLens_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChargeLine" ADD CONSTRAINT "ChargeLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
