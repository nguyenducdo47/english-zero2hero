export type TranslationEntityType = "tense_group" | "tense" | "question";

export function questionIdParam(selectedId: string): number | null {
  const id = Number.parseInt(selectedId, 10);
  if (!Number.isFinite(id) || id < 1) return null;
  return id;
}

export function translationLookupParams(
  entityType: TranslationEntityType,
  selectedSlug: string,
  selectedId: string,
): URLSearchParams | null {
  const params = new URLSearchParams({ type: entityType });
  if (entityType === "question") {
    const id = questionIdParam(selectedId);
    if (id === null) return null;
    params.set("id", String(id));
  } else if (selectedSlug) {
    params.set("slug", selectedSlug);
  } else {
    return null;
  }
  return params;
}

export type TranslationFieldDef = {
  key: string;
  multiline: boolean;
  linesAsArray?: boolean;
};

export const TRANSLATION_SCHEMA: Record<TranslationEntityType, TranslationFieldDef[]> = {
  tense_group: [{ key: "name", multiline: false }],
  tense: [
    { key: "name", multiline: false },
    { key: "pitfalls", multiline: true },
    { key: "usage", multiline: true, linesAsArray: true },
  ],
  question: [
    { key: "prompt", multiline: true },
    { key: "explanation", multiline: true },
  ],
};

export function attributesToForm(
  attrs: Record<string, unknown> | undefined,
  type: TranslationEntityType,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const field of TRANSLATION_SCHEMA[type]) {
    const raw = attrs?.[field.key];
    if (field.linesAsArray && Array.isArray(raw)) {
      out[field.key] = raw.map(String).join("\n");
    } else if (raw != null) {
      out[field.key] = String(raw);
    } else {
      out[field.key] = "";
    }
  }
  return out;
}

export function buildViEnTranslations(
  viForm: Record<string, string>,
  enForm: Record<string, string>,
  type: TranslationEntityType,
): Record<string, Record<string, unknown>> {
  return {
    vi: formToAttributes(viForm, type),
    en: formToAttributes(enForm, type),
  };
}

export function parseJsonObject(raw: string, errorLabel: string): Record<string, unknown> {
  const trimmed = raw.trim();
  if (!trimmed) return {};
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    throw new Error(`${errorLabel}: must be a JSON object`);
  } catch (e) {
    if (e instanceof Error && e.message.includes("must be")) throw e;
    throw new Error(`${errorLabel}: invalid JSON`);
  }
}

export function parseJsonValue(raw: string, errorLabel: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    throw new Error(`${errorLabel}: invalid JSON`);
  }
}

export function formToAttributes(
  form: Record<string, string>,
  type: TranslationEntityType,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of TRANSLATION_SCHEMA[type]) {
    const text = form[field.key] ?? "";
    if (field.linesAsArray) {
      out[field.key] = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    } else {
      out[field.key] = text;
    }
  }
  return out;
}
