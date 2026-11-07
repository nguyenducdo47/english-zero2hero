import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooterCopyright } from "@/components/layout/site-footer-copyright";
import { Separator } from "@/components/ui/separator";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/grammar" className="hover:text-primary">
            {t("grammar")}
          </Link>
          <Link href="/dashboard" className="hover:text-primary">
            {t("dashboard")}
          </Link>
          <Link href="/roadmap" className="hover:text-primary">
            {t("roadmap")}
          </Link>
          <Link href="/exams" className="hover:text-primary">
            {t("exams")}
          </Link>
        </div>
        <Separator />
        <p>{t("tagline")}</p>
        <SiteFooterCopyright />
      </div>
    </footer>
  );
}
