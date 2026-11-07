"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthToken } from "@/hooks/use-auth-token";
import { User } from "lucide-react";

export function HeaderAuthLink() {
  const t = useTranslations("nav");
  const token = useAuthToken();
  const loggedIn = Boolean(token);

  if (loggedIn) {
    return (
      <Link
        href="/profile"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "ml-1 gap-1")}
      >
        <User className="size-4" aria-hidden />
        <span className="hidden sm:inline">{t("profile")}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "ml-1")}
    >
      {t("login")}
    </Link>
  );
}
