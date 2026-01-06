/**
 * Transliteration utility for converting Cyrillic to Latin characters
 * Supports Ukrainian and Russian alphabets
 *
 * @example
 * transliterate('Новини') // 'Novyny'
 * transliterate('Технології') // 'Tekhnolohii'
 * transliterate('Бізнес') // 'Biznes'
 *
 * generateSlug('Сучасна Архітектура') // 'suchasna-arkhitektura'
 * generateSlug('Новини та Події 2024') // 'novyny-ta-podii-2024'
 * generateSlug('Інновації в Бізнесі!') // 'innovatsii-v-biznesi'
 */

// Ukrainian transliteration map (based on Ukrainian National transliteration)
const ukrainianMap: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'h',
  ґ: 'g',
  д: 'd',
  е: 'e',
  є: 'ie',
  ж: 'zh',
  з: 'z',
  и: 'y',
  і: 'i',
  ї: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ь: '',
  ю: 'iu',
  я: 'ia',

  А: 'A',
  Б: 'B',
  В: 'V',
  Г: 'H',
  Ґ: 'G',
  Д: 'D',
  Е: 'E',
  Є: 'Ie',
  Ж: 'Zh',
  З: 'Z',
  И: 'Y',
  І: 'I',
  Ї: 'I',
  Й: 'I',
  К: 'K',
  Л: 'L',
  М: 'M',
  Н: 'N',
  О: 'O',
  П: 'P',
  Р: 'R',
  С: 'S',
  Т: 'T',
  У: 'U',
  Ф: 'F',
  Х: 'Kh',
  Ц: 'Ts',
  Ч: 'Ch',
  Ш: 'Sh',
  Щ: 'Shch',
  Ь: '',
  Ю: 'Iu',
  Я: 'Ia',
}

// Russian transliteration map (for additional Russian letters)
const russianMap: Record<string, string> = {
  ы: 'y',
  э: 'e',
  ъ: '',
  Ы: 'Y',
  Э: 'E',
  Ъ: '',
}

// Combined transliteration map
const transliterationMap: Record<string, string> = {
  ...ukrainianMap,
  ...russianMap,
}

/**
 * Transliterate Cyrillic text to Latin characters
 * @param text - Text to transliterate
 * @returns Transliterated text
 */
export function transliterate(text: string): string {
  return text
    .split('')
    .map((char) => transliterationMap[char] || char)
    .join('')
}

/**
 * Generate a URL-friendly slug from a string
 * Handles Cyrillic transliteration and URL sanitization
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 */
export function generateSlug(text: string): string {
  if (!text) return ''

  // First, transliterate Cyrillic characters
  const transliterated = transliterate(text)

  // Convert to lowercase and create slug
  return (
    transliterated
      .toLowerCase()
      .trim()
      // Replace spaces and special characters with hyphens
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      // Remove consecutive hyphens
      .replace(/-+/g, '-')
  )
}

/**
 * Ensure slug is unique by appending a number if needed
 * Note: This is a basic implementation. For production use,
 * you should check against the database for true uniqueness.
 * @param baseSlug - Base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function ensureUniqueSlug(baseSlug: string, existingSlugs: string[] = []): string {
  let slug = baseSlug
  let counter = 1

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}
