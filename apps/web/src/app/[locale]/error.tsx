"use client";

import { useEffect } from "react";
import { HttpStatusPageI18n } from "@/components/errors/http-status-page-i18n";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function LocaleError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <HttpStatusPageI18n
      code={500}
      primaryCta="retry"
      showRetry
      showHome
      onRetry={reset}
    />
  );
}
