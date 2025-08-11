export interface PlaceholderValue {
  key: string;
  value: string;
}

export function extractPlaceholders(content: string): string[] {
  const regex = /\{\{([A-Z_]+)\}\}/g;
  const matches = content.matchAll(regex);
  return Array.from(new Set(Array.from(matches, m => m[1])));
}

export function replacePlaceholders(
  content: string,
  values: Record<string, string>
): string {
  return content.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) => {
    return values[key] || match;
  });
}

export function validatePlaceholders(content: string): boolean {
  const regex = /\{\{[A-Z_]+\}\}/g;
  const matches = content.match(regex) || [];
  return matches.every(match => /^\{\{[A-Z_]+\}\}$/.test(match));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}