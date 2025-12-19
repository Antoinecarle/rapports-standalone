/**
 * Utilitaires pour la validation et le formatage des dates
 */

/**
 * Vérifie si une valeur de date est valide
 * @param dateValue - La valeur de date à vérifier (string, number, Date, etc.)
 * @returns true si la date est valide, false sinon
 */
export const isValidDate = (dateValue: any): boolean => {
  // Vérifier si la valeur existe
  if (!dateValue) {
    return false;
  }

  // Si c'est une chaîne vide
  if (typeof dateValue === 'string' && dateValue.trim() === '') {
    return false;
  }

  // Essayer de créer un objet Date
  const date = new Date(dateValue);

  // Vérifier si la date est valide
  // Une date invalide retourne NaN pour getTime()
  return !isNaN(date.getTime());
};

/**
 * Formate une date en format français court (JJ/MM/AA à HH:MM)
 * @param isoDate - La date au format ISO ou tout format accepté par Date
 * @returns La date formatée ou null si la date est invalide
 */
export const formatDate = (isoDate: string | Date | number): string | null => {
  if (!isValidDate(isoDate)) {
    return null;
  }

  const date = new Date(isoDate);

  try {
    const dateStr = date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });

    const timeStr = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${dateStr} à ${timeStr}`;
  } catch (error) {
    return null;
  }
};

/**
 * Formate une date en format français long (JJ/MM/AAAA HH:MM)
 * @param dateStr - La date au format ISO ou tout format accepté par Date
 * @returns La date formatée ou null si la date est invalide
 */
export const formatDateLong = (dateStr: string | Date | number): string | null => {
  if (!isValidDate(dateStr)) {
    return null;
  }

  const date = new Date(dateStr);

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    return null;
  }
};

/**
 * Formate une date en format français (JJ/MM/AAAA) sans l'heure
 * @param dateStr - La date au format ISO ou tout format accepté par Date
 * @returns La date formatée ou null si la date est invalide
 */
export const formatDateOnly = (dateStr: string | Date | number): string | null => {
  if (!isValidDate(dateStr)) {
    return null;
  }

  const date = new Date(dateStr);

  try {
    return date.toLocaleDateString('fr-FR');
  } catch (error) {
    return null;
  }
};

/**
 * Formate une date pour l'affichage dans les consignes IA
 * @param dateStr - La date au format ISO ou tout format accepté par Date
 * @returns La date formatée ou null si la date est invalide
 */
export const formatConsigneDate = (dateStr: string | Date | number): string | null => {
  if (!isValidDate(dateStr)) {
    return null;
  }

  const date = new Date(dateStr);

  try {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return null;
  }
};

/**
 * Convertit une date au format Bubble ("Nov 26, 2025 11:22 am") en format HH:mm
 * @param bubbleDate - La date au format Bubble
 * @returns L'heure formatée en HH:mm ou null si la date est invalide
 */
export const formatBubbleDateToTime = (bubbleDate: string | undefined | null): string | null => {
  if (!bubbleDate || typeof bubbleDate !== 'string' || bubbleDate.trim() === '') {
    return null;
  }

  if (!isValidDate(bubbleDate)) {
    return null;
  }

  const date = new Date(bubbleDate);

  try {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return null;
  }
};

/**
 * Convertit une date au format Bubble ("Nov 26, 2025 11:22 am") en format complet JJ/MM/AAAA HH:mm
 * @param bubbleDate - La date au format Bubble
 * @returns La date formatée ou null si la date est invalide
 */
export const formatBubbleDateToDateTime = (bubbleDate: string | undefined | null): string | null => {
  if (!bubbleDate || typeof bubbleDate !== 'string' || bubbleDate.trim() === '') {
    return null;
  }

  if (!isValidDate(bubbleDate)) {
    return null;
  }

  const date = new Date(bubbleDate);

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    return null;
  }
};

