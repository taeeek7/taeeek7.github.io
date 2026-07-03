// URL-safe slug for tags (keeps Korean, collapses the rest to dashes).
export function tagSlug(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^\w가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
