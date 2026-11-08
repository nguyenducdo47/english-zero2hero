"use client";

import { useTranslations } from "next-intl";
import type { HttpStatusCode } from "@/lib/error-page-copy";
import { buildErrorPageProps } from "@/lib/error-page-props";
import { HttpStatusPage, type ErrorCtaPrimary } from "./http-status-page";

type Props = {
  code: HttpStatusCode;
  primaryCta?: ErrorCtaPrimary;
  showHome?: boolean;
  showDashboard?: boolean;
  showLogin?: boolean;
  showExplore?: boolean;
  showRetry?: boolean;
  showLearningShortcuts?: boolean;
  onRetry?: () => void;
};

export function HttpStatusPageI18n({
  code,
  primaryCta = "home",
  showHome = true,
  showDashboard = false,
  showLogin = false,
  showExplore = false,
  showRetry = false,
  showLearningShortcuts = false,
  onRetry,
}: Props) {
  const t = useTranslations("errors");
  const nav = useTranslations("nav");

  const props = buildErrorPageProps(code, t, nav("brand"), {
    primaryCta,
    showHome,
    showDashboard,
    showLogin,
    showExplore,
    showRetry,
    showLearningShortcuts,
    onRetry,
  });

  return <HttpStatusPage {...props} />;
}
