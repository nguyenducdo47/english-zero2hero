"use client";

import { HttpStatusPageI18n } from "@/components/errors/http-status-page-i18n";

export function MaintenancePageClient() {
  return (
    <HttpStatusPageI18n
      code={503}
      primaryCta="retry"
      showRetry
      showHome
      onRetry={() => window.location.reload()}
    />
  );
}
