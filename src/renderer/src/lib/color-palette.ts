/**
 * 12-color tag palette matching --tag-* CSS custom properties in globals.css.
 * Colors are light/pastel for readability when used as badge backgrounds.
 */
export const TAG_COLORS: readonly string[] = [
  '#FEF3C7', // amber
  '#D1FAE5', // emerald
  '#EDE9FE', // violet
  '#FEE2E2', // rose
  '#DBEAFE', // blue
  '#FCE7F3', // pink
  '#E0E7FF', // indigo
  '#CCFBF1', // teal
  '#FEF9C3', // yellow
  '#F3E8FF', // purple
  '#FFEDD5', // orange
  '#ECFCCB', // lime
]

/**
 * Deterministic color assignment based on the tag name.
 * Uses a simple djb2 hash so the same name always gets the same color,
 * even if the tag is deleted and recreated.
 */
export function assignColor(name: string): string {
  let hash = 5381
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) + hash + name.charCodeAt(i)) | 0
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}
