import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-lg font-bold text-indigo-700">
          English Zero2Hero
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm font-medium text-slate-700">
          <Link href="/grammar" className="hover:text-indigo-600">
            12 thì
          </Link>
          <Link href="/exams" className="hover:text-indigo-600">
            Ôn thi
          </Link>
          <Link href="/mock-exams" className="hover:text-indigo-600">
            Thi thử
          </Link>
          <Link href="/login" className="hover:text-indigo-600">
            Đăng nhập
          </Link>
        </nav>
      </div>
    </header>
  );
}
