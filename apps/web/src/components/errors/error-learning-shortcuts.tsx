import { BookOpen, GraduationCap, Target } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  grammarLabel: string;
  examsLabel: string;
  dashboardLabel: string;
  sectionTitle: string;
};

export function ErrorLearningShortcuts({
  sectionTitle,
  grammarLabel,
  examsLabel,
  dashboardLabel,
}: Props) {
  const links = [
    { href: "/grammar" as const, label: grammarLabel, icon: BookOpen },
    { href: "/exams" as const, label: examsLabel, icon: Target },
    { href: "/dashboard" as const, label: dashboardLabel, icon: GraduationCap },
  ];

  return (
    <nav aria-labelledby="error-learning-nav" className="mt-10 w-full max-w-md">
      <p id="error-learning-nav" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {sectionTitle}
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {links.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground shadow-sm",
                "transition-colors hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            >
              <Icon className="size-4 shrink-0 text-primary" aria-hidden />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
