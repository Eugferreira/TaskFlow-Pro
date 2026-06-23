/**
 * Sanitizes a string input by removing HTML tags to prevent XSS (Cross-Site Scripting) attacks.
 * This ensures that task titles and other text inputs are stored as safe plain text.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip all HTML tags
    .trim();
}