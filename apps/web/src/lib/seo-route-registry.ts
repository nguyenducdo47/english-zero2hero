/** Mirror of apps/api/config/seo_routes.php static keys (labels from API registry at runtime). */
export const SEO_STATIC_ROUTE_KEYS = [
  "home",
  "grammar",
  "grammar-analyze",
  "exams",
  "mock-exams",
  "roadmap",
  "login",
  "dashboard",
  "profile",
  "analytics",
] as const;

export type SeoStaticRouteKey = (typeof SEO_STATIC_ROUTE_KEYS)[number];
