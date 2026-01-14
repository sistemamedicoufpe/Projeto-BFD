/**
 * Formata uma data no formato brasileiro (DD/MM/YYYY)
 * @param date - Data a ser formatada
 * @returns Data formatada
 */
export function formatDateBR(date: Date | string): string {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Formata uma data no formato ISO (YYYY-MM-DD)
 * @param date - Data a ser formatada
 * @returns Data no formato ISO
 */
export function formatDateISO(date: Date | string): string {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString().split('T')[0];
}

/**
 * Formata uma data com hora (DD/MM/YYYY HH:MM)
 * @param date - Data a ser formatada
 * @returns Data e hora formatadas
 */
export function formatDateTimeBR(date: Date | string): string {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Formata uma data de forma relativa (há X dias, há X horas, etc.)
 * @param date - Data a ser formatada
 * @returns Data formatada de forma relativa
 */
export function formatRelativeDate(date: Date | string): string {
  if (!date) return '';

  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Agora há pouco';
  if (diffMins < 60) return `Há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays < 30) return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;

  return formatDateBR(dateObj);
}

/**
 * Formata um período de tempo em formato legível
 * @param minutes - Número de minutos
 * @returns Período formatado (ex: "2h 30min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}
