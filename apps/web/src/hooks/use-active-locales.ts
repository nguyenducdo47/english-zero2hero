"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import {
  type CatalogLocale,
  fetchActiveLocales,
  localeOptionLabel,
} from "@/lib/locale-catalog";

function routingFallback(): CatalogLocale[] {
  return routing.locales.map((code) => ({
    code,
    name: code,
    native_name: code,
  }));
}

export function useActiveLocales() {
  const uiLocale = useLocale() as Locale;
  const [locales, setLocales] = useState<CatalogLocale[]>(() => routingFallback());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await fetchActiveLocales(uiLocale);
        if (!cancelled && list.length > 0) {
          setLocales(list);
        }
      } catch {
        if (!cancelled) {
          setLocales(routingFallback());
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uiLocale]);

  return { locales, loading, localeOptionLabel };
}
