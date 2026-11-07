import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { userHasAdminAccess, type AuthUser } from "@/lib/progress-sync";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const meRes = await fetch(`${API_BASE}/api/v1/auth/me`, {
    headers: {
      Authorization: auth,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!meRes.ok) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const me = (await meRes.json()) as { data?: AuthUser };
  if (!userHasAdminAccess(me.data)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  revalidateTag("seo", "max");

  return NextResponse.json({ ok: true });
}
