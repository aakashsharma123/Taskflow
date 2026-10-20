const accents = [
  "bg-tint-purple text-tint-purple-text",
  "bg-tint-teal text-tint-teal-text",
  "bg-tint-orange text-tint-orange-text",
  "bg-tint-magenta text-tint-magenta-text",
  "bg-tint-lime text-tint-lime-text",
] as const;

export type Accent = (typeof accents)[number];

export function accentAt(index: number): Accent {
  return accents[index % accents.length];
}

export function pickAccent(key: string): Accent {
  const hash = [...key.toLowerCase()].reduce(
    (sum, letter) => sum + letter.charCodeAt(0),
    0,
  );
  return accentAt(hash);
}
