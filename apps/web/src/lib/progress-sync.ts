import type { Locale } from "@/i18n/routing";
import { apiGet, apiPut } from "@/lib/api";
import { readLearningStats, writeLearningStats, type LearningStats } from "@/lib/learning-stats";

const PROGRESS_KEY = "e2h_learning";

export type AuthRole = {
  id: number;
  slug: string;
  name: string;
  permissions?: string[] | null;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
  roles?: AuthRole[];
};

export function userHasAdminAccess(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.is_admin) return true;
  return (user.roles ?? []).some((r) =>
    (r.permissions ?? []).includes("admin.access"),
  );
}

export async function fetchAuthMe(
  locale: Locale,
  token: string,
): Promise<AuthUser | null> {
  const res = await apiGet<{ data: AuthUser }>("/api/v1/auth/me", locale, token);
  return res.data ?? null;
}

export async function pullServerLearningStats(
  locale: Locale,
  token: string,
): Promise<LearningStats | null> {
  const res = await apiGet<{
    data: { payload: Partial<LearningStats> } | null;
  }>(`/api/v1/user/progress/${PROGRESS_KEY}`, locale, token);
  if (!res.data?.payload) return null;
  const local = readLearningStats();
  const merged: LearningStats = {
    ...local,
    ...res.data.payload,
    completedTenses: [
      ...new Set([
        ...local.completedTenses,
        ...(res.data.payload.completedTenses ?? []),
      ]),
    ],
    completedGroups: [
      ...new Set([
        ...local.completedGroups,
        ...(res.data.payload.completedGroups ?? []),
      ]),
    ],
  };
  writeLearningStats(merged);
  return merged;
}

export async function pushLearningStatsToServer(
  locale: Locale,
  token: string,
): Promise<void> {
  const stats = readLearningStats();
  await apiPut(`/api/v1/user/progress/${PROGRESS_KEY}`, { payload: stats }, locale, token);
}
