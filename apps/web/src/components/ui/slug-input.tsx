"use client";

import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { normalizeSlugInput } from "@/lib/slug";

export type SlugInputProps = Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export function SlugInput({ value, onChange, ...props }: SlugInputProps) {
  return (
    <Input
      {...props}
      autoComplete="off"
      spellCheck={false}
      value={value}
      onChange={(e) => onChange(normalizeSlugInput(e.target.value))}
    />
  );
}
