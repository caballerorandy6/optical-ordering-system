import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NewUserForm } from "@/components/config/new-user-form";
import { UserActiveToggle } from "@/components/config/user-active-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return { title: t("settings") };
}

export default async function ConfigPage() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/ordenes");
  const t = await getTranslations("config");
  const tnav = await getTranslations("nav");
  const tcommon = await getTranslations("common");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, banned: true, createdAt: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>

      <Card>
        <CardHeader>
          <CardTitle>{t("newUser")}</CardTitle>
        </CardHeader>
        <CardContent>
          <NewUserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("users")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("name")}</TableHead>
                <TableHead>{t("email")}</TableHead>
                <TableHead>{t("role")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{tcommon("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>
                      {u.role === "ADMIN" ? tnav("roleAdmin") : tnav("roleStaff")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.banned ? (
                      <Badge variant="destructive">{t("deactivated")}</Badge>
                    ) : (
                      <Badge variant="outline">{t("active")}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserActiveToggle
                      userId={u.id}
                      isBanned={!!u.banned}
                      isSelf={u.id === user.id}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
