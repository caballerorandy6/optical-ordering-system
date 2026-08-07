"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { setUserActive } from "@/actions/users";
import { Button } from "@/components/ui/button";

export function UserActiveToggle({
  userId,
  isBanned,
  isSelf,
}: {
  userId: string;
  isBanned: boolean;
  isSelf: boolean;
}) {
  const router = useRouter();
  const t = useTranslations("config");
  const [isSaving, setIsSaving] = useState(false);

  async function toggle() {
    setIsSaving(true);
    const result = await setUserActive(userId, isBanned);
    setIsSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(isBanned ? t("reactivated_toast") : t("deactivated_toast"));
    router.refresh();
  }

  if (isSelf) return null;

  return (
    <Button
      variant={isBanned ? "outline" : "destructive"}
      size="sm"
      onClick={toggle}
      disabled={isSaving}
    >
      {isSaving ? "..." : isBanned ? t("reactivate") : t("deactivate")}
    </Button>
  );
}
