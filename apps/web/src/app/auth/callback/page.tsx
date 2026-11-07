"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setStoredToken } from "@/lib/api";

function CallbackInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [msg, setMsg] = useState("Đang xử lý...");

  useEffect(() => {
    const token = params.get("token");
    if (token) {
      setStoredToken(token);
      setMsg("Đăng nhập thành công.");
      router.replace("/exams");
    } else {
      setMsg("Thiếu token. Đăng nhập lại.");
    }
  }, [params, router]);

  return <p className="text-center text-slate-700">{msg}</p>;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="text-center">Đang xử lý...</p>}>
      <CallbackInner />
    </Suspense>
  );
}
