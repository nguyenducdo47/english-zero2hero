import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  Globe,
  HelpCircle,
  Languages,
  LayoutDashboard,
  Layers,
  Plug,
  Search,
  Shield,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  id: string;
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

export type AdminNavGroup = {
  id: string;
  labelKey: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    labelKey: "nav.overview",
    items: [
      {
        id: "dashboard",
        href: "/admin",
        labelKey: "nav.dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "content",
    labelKey: "nav.content",
    items: [
      {
        id: "locales",
        href: "/admin/content/locales",
        labelKey: "nav.locales",
        icon: Globe,
      },
      {
        id: "translations",
        href: "/admin/content/translations",
        labelKey: "nav.translations",
        icon: Languages,
      },
      {
        id: "seo",
        href: "/admin/content/seo",
        labelKey: "nav.seo",
        icon: Search,
      },
      {
        id: "tense-groups",
        href: "/admin/content/tense-groups",
        labelKey: "nav.tenseGroups",
        icon: Layers,
      },
      {
        id: "tenses",
        href: "/admin/content/tenses",
        labelKey: "nav.tenses",
        icon: BookOpen,
      },
      {
        id: "questions",
        href: "/admin/content/questions",
        labelKey: "nav.questions",
        icon: HelpCircle,
      },
      {
        id: "exams",
        href: "/admin/content/exams",
        labelKey: "nav.exams",
        icon: ClipboardList,
      },
    ],
  },
  {
    id: "system",
    labelKey: "nav.system",
    items: [
      {
        id: "integrations",
        href: "/admin/system/integrations",
        labelKey: "nav.integrations",
        icon: Plug,
      },
      {
        id: "users",
        href: "/admin/system/users",
        labelKey: "nav.users",
        icon: Users,
      },
      {
        id: "roles",
        href: "/admin/system/roles",
        labelKey: "nav.roles",
        icon: Shield,
      },
    ],
  },
];

export function adminBreadcrumbKey(segment: string): string | null {
  const map: Record<string, string> = {
    admin: "nav.dashboard",
    content: "nav.content",
    system: "nav.system",
    locales: "nav.locales",
    translations: "nav.translations",
    seo: "nav.seo",
    "tense-groups": "nav.tenseGroups",
    tenses: "nav.tenses",
    questions: "nav.questions",
    exams: "nav.exams",
    integrations: "nav.integrations",
    users: "nav.users",
    roles: "nav.roles",
  };
  return map[segment] ?? null;
}
