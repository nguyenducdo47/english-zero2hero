"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { setStoredToken } from "@/lib/api";

function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const t = useTranslations("auth");
  const [msg, setMsg] = useState(t("processing"));

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      setStoredToken(token);
      setMsg(t("success"));
      router.replace("/exams");
    } else {
      setMsg(t("missingToken"));
    }
  }, [params, router, t]);

  return <p className="text-center text-slate-700 dark:text-slate-300">{msg}</p>;
}

export function AuthCallbackClient() {
  const t = useTranslations("auth");
  return (
    <Suspense fallback={<p className="text-center">{t("processing")}</p>}>
      <CallbackInner />
    </Suspense>
  );
}
