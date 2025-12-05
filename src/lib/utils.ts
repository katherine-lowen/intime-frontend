// src/lib/utils.ts

type ClassValue =
  | string
  | null
  | undefined
  | false
  | Record<string, boolean | null | undefined>;

export function cn(...values: ClassValue[]) {
  const classes: string[] = [];

  for (const value of values) {
    if (!value) continue;

    if (typeof value === "string") {
      classes.push(value);
    } else if (typeof value === "object") {
      for (const [key, condition] of Object.entries(value)) {
        if (condition) classes.push(key);
      }
    }
  }

  return classes.join(" ");
}
