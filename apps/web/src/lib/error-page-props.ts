import type { HttpStatusPageProps } from "@/components/errors/http-status-page";
import { getHttpStatusCopy, type HttpStatusCode } from "@/lib/error-page-copy";

type ErrorsT = (key: string, values?: { code?: number }) => string;

export function buildErrorPageProps(
  code: HttpStatusCode,
  t: ErrorsT,
  navBrand: string,
  overrides: Partial<HttpStatusPageProps> = {},
): HttpStatusPageProps {
  const copy = getHttpStatusCopy(code, t);
  return {
    code,
    title: copy.title,
    description: copy.description,
    statusLabel: t("statusLabel", { code }),
    brandLabel: navBrand,
    homeLabel: t("actionHome"),
    dashboardLabel: t("actionDashboard"),
    loginLabel: t("actionLogin"),
    retryLabel: t("actionRetry"),
    exploreLabel: t("actionExplore"),
    learningNavTitle: t("learningNavTitle"),
    grammarShortcutLabel: t("shortcutGrammar"),
    examsShortcutLabel: t("shortcutExams"),
    dashboardShortcutLabel: t("shortcutDashboard"),
    ...overrides,
  };
}
