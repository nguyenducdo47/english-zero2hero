"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthToken } from "@/hooks/use-auth-token";
import { User } from "lucide-react";

type HeaderAuthLinkProps = {
  className?: string;
  onNavigate?: () => void;
};

const authActiveClass =
  "border-primary/30 bg-primary/12 font-semibold text-primary shadow-sm ring-1 ring-primary/25 hover:bg-primary/18 hover:text-primary";

export function HeaderAuthLink({ className, onNavigate }: HeaderAuthLinkProps = {}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const token = useAuthToken();
  const loggedIn = Boolean(token);

  if (loggedIn) {
    const active =
      pathname === "/profile" || pathname.startsWith("/profile/");
    return (
      <Link
        href="/profile"
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "ml-1 gap-1",
          active && authActiveClass,
          className,
        )}
      >
        <User className="size-4" aria-hidden />
        <span className="hidden sm:inline">{t("profile")}</span>
      </Link>
    );
  }

  const active = pathname === "/login" || pathname.startsWith("/login/");
  return (
    <Link
      href="/login"
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: "outline", size: "sm" }),
        "ml-1",
        active && authActiveClass,
        className,
      )}
    >
      {t("login")}
    </Link>
  );
}
