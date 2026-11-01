/**
 * Date utility functions for School of Agriculture - Angunakolapelessa
 * Standard display format throughout the app: DD/MM/YYYY
 */

/**
 * Format any date string (YYYY-MM-DD, ISO 8601 string, or Date) to DD/MM/YYYY format.
 * Examples:
 *   "2025-10-01" -> "01/10/2025"
 *   "2026-11-09T18:00:00Z" -> "09/11/2026"
 */
export function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) return '';

  if (typeof dateInput === 'string') {
    // Fast match for YYYY-MM-DD
    const ymdMatch = dateInput.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      const [, year, month, day] = ymdMatch;
      return `${day}/${month}/${year}`;
    }
  }

  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date and time to DD/MM/YYYY HH:mm format.
 * Example: "09/11/2026 18:00"
 */
export function formatDateTime(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${mins}`;
}
