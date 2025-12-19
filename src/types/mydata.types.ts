/**
 * Types pour la structure du fichier mydata.json
 * Ces types représentent les données brutes du parcours utilisateur
 */

export interface Agent {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  type: string;
  type_label: string;
  verification_status: string;
}

export interface Parcours {
  id: string;
  name: string;
  type: string;
  start_time: string;
  current_time: string;
  duration_minutes: number;
  completion_percentage: number;
  total_pieces: number;
  completed_pieces: number;
  pieces_with_issues: number;
}

export interface PhotoData {
  url: string;
  timestamp: string;
  photo_id: string;
  etape_id: string;
  validated: boolean;
  retake_count: number;
  source: string;
}

export interface Etape {
  etape_id: string;
  type: "button_click" | "photo_taken";
  etape_type: string;
  status: string;
  timestamp: string;
  is_todo: boolean;
  todo_title: string;
  action?: string;
  comment: string;
  photos_attached?: string[];
  // Pour les photos
  photo_id?: string;
  photo_url?: string;
  photo_base64?: string | null;
  validated?: boolean;
  retake_count?: number;
}

export interface Piece {
  piece_id: string;
  nom: string;
  status: string;
  etapes: Etape[];
}

export interface CheckinStats {
  total_pieces: number;
  total_photos: number;
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
}

export interface Timestamps {
  session_start?: string;
  snapshot_created?: string;
  checkin_completed?: string;
  exit_questions_completed?: string | null;
  checkinStartHour?: string | null;
  checkinEndHour?: string | null;
  checkoutStartHour?: string | null;
  checkoutEndHour?: string | null;
}

export interface Checkin {
  pieces: Piece[];
  stats: CheckinStats;
  timestamp: string;
  timestamps?: Timestamps;
}

export interface Signalement {
  signalement_id: string;
  etape_id: string | null;
  room_id: string;
  titre: string;
  commentaire: string;
  img_url: string | null;
  img_base64: string | null;
  flow_type: string;
  origine: string;
  status: string;
  priorite: boolean;
  created_at: string;
  updated_at: string;
  description: string;
  comment: string;
  timestamp: string;
  severity: string;
  signalement_type: string;
  photos?: PhotoData[];
}

/**
 * Types pour les signalements depuis l'API Bubble
 */
export interface BubbleSignalement {
  _id: string;
  Piece_ref: string;
  Conciergerie: string;
  "phone signaleur": string;
  parcours_ref: string;
  typeText: string;
  OS_signalementStatut: string;
  "Nom signaleur": string;
  description: string;
  rapport_ref: string;
  "Prenom signaleur": string;
  "Created Date": number;
  "Modified Date": number;
  "Created By": string;
  logement_ref: string;
  photo?: string; // URL de la photo (optionnel)
}

/**
 * Consigne IA depuis l'API Bubble
 */
export interface BubbleConsigneIA {
  _id: string;
  Commentaire: string;
  "Created By": string;
  "Created Date": number;
  "Modified Date": number;
  Piece?: string; // ID de la pièce (optionnel)
  os_consigneType?: "ignorer" | "surveiller"; // Type de consigne
  REF?: string; // ID du parcours
}

export interface BubbleSignalementResponse {
  status: string;
  response: {
    signalement: BubbleSignalement[];
    consigneIA?: BubbleConsigneIA[]; // Ajout des consignes IA
  };
}

/**
 * Structure complète du fichier mydata.json
 */
export interface MyDataJSON {
  webhook_version: string;
  schema: string;
  checkID: string;
  parcours_id: string;
  logement_id: string | null;
  logement_name: string | null;
  agent: Agent;
  parcours: Parcours;
  checkin: Checkin;
  checkout: any | null;
  signalements: Signalement[];
  timestamps?: Timestamps;  // Timestamps au niveau racine
}

