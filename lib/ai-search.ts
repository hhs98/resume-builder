export const SEARCH_AI_MIN_WORDS = 5

export function countSearchWords(value: string): number {
  return value.trim().split(/\s+/).filter(Boolean).length
}
