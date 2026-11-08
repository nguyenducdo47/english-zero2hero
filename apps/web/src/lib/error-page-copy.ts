export type HttpStatusCode = 401 | 403 | 404 | 500 | 503;

/** next-intl `getTranslations("errors")` / `useTranslations("errors")` — copy theo locale đang chọn. */
export type ErrorsTranslator = (key: string) => string;

export type HttpStatusCopy = {
  title: string;
  description: string;
  metaTitle: string;
};

const COPY_KEY: Record<HttpStatusCode, { title: string; description: string; metaTitle: string }> = {
  404: {
    title: "notFoundTitle",
    description: "notFoundDescription",
    metaTitle: "metaTitle404",
  },
  403: {
    title: "forbiddenTitle",
    description: "forbiddenDescription",
    metaTitle: "metaTitle403",
  },
  401: {
    title: "loginRequiredTitle",
    description: "loginRequiredDescription",
    metaTitle: "metaTitle401",
  },
  500: {
    title: "serverErrorTitle",
    description: "serverErrorDescription",
    metaTitle: "metaTitle500",
  },
  503: {
    title: "maintenanceTitle",
    description: "maintenanceDescription",
    metaTitle: "metaTitle503",
  },
};

export function getHttpStatusCopy(code: HttpStatusCode, t: ErrorsTranslator): HttpStatusCopy {
  const keys = COPY_KEY[code] ?? COPY_KEY[500];
  return {
    title: t(keys.title),
    description: t(keys.description),
    metaTitle: t(keys.metaTitle),
  };
}

export function statusAccentClass(code: HttpStatusCode): string {
  switch (code) {
    case 404:
      return "from-primary/20 to-primary/5 text-primary border-primary/25";
    case 403:
    case 401:
      return "from-warning/25 to-warning/5 text-warning border-warning/30";
    case 503:
      return "from-secondary/25 to-secondary/5 text-secondary border-secondary/30";
    case 500:
    default:
      return "from-muted to-background text-foreground border-border";
  }
}
