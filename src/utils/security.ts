/**
 * Cleans and trims the input string.
 * We rely on React's built-in automatic escaping to prevent XSS (Cross-Site Scripting)
 * when rendering values in JSX, avoiding fragile custom regex-based sanitization.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input.trim();
}