"use client";

import "./globals.css";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: Props) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-[#F8FAFC] font-sans text-[#0F172A] antialiased dark:bg-[#0F172A] dark:text-[#F1F5F9]">
        <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12 text-center">
          <p className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-1.5 font-semibold text-2xl text-[#2563EB] dark:border-[#334155] dark:bg-[#1E293B]">
            500
          </p>
          <h1 className="mt-5 text-2xl font-semibold">Oops! Something Went Wrong</h1>
          <p className="mt-3 max-w-md text-[#64748B]">
            Something unexpected happened on our side. Please try again later.
          </p>
          <p lang="vi" className="mt-4 max-w-md border-l-2 border-[#14B8A6]/60 pl-4 text-left text-sm text-[#64748B]">
            Hệ thống đang gặp sự cố ngoài dự kiến. Vui lòng thử lại sau ít phút.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-8 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2563EB]/40"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
