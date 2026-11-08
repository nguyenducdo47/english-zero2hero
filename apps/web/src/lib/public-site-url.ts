const DEFAULT_SITE = "http://localhost:3000";
const DEFAULT_API = "http://localhost:8000";

export function publicSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE).replace(/\/$/, "");
}

/** Map API-built absolute URLs to the public Next.js origin (sitemap, robots). */
export function toPublicSiteUrl(href: string): string {
  const site = publicSiteOrigin();
  if (!href) {
    return site;
  }

  if (!href.startsWith("http://") && !href.startsWith("https://")) {
    return `${site}${href.startsWith("/") ? href : `/${href}`}`;
  }

  try {
    const parsed = new URL(href);
    const apiOrigin = new URL(
      process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API,
    ).origin;
    if (parsed.origin === apiOrigin) {
      return `${site}${parsed.pathname}${parsed.search}`;
    }

    return href;
  } catch {
    return `${site}${href.startsWith("/") ? href : `/${href}`}`;
  }
}
