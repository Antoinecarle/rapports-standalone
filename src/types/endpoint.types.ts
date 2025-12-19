/**
 * Types pour l'endpoint API universel
 * Endpoint: /api/1.1/wf/endpointrapportform/initialize
 */

// ============================================
// Types d'Actions
// ============================================

export type ActionType =
  | 'CREATE_SIGNALEMENT'
  | 'CREATE_CONSIGNE_IA'
  | 'UPDATE_CONSIGNE_IA'
  | 'DELETE_CONSIGNE_IA'
  | 'MARK_FALSE_POSITIVE'
  | 'UPDATE_SIGNALEMENT_STATUS'
  | 'SELECT_PHOTO_REFERENCE'
  | 'DELETE_PHOTO';

// ============================================
// Données Spécifiques par Type d'Action
// ============================================

export interface CreateSignalementData {
  pieceId: string; // ID unique de la pièce (ex: "piece_salon_123")
  etapeId?: string | null; // ID de l'étape associée au problème (optionnel)
  probleme: string;
  commentaire: string;
  photoUrl: string | null;
  photoBase64: string | null;
}

export interface CreateConsigneIAData {
  pieceId: string; // ID unique de la pièce (ex: "piece_cuisine_456")
  probleme: string | null;
  consigne: string;
  type: 'ignorer' | 'surveiller';
}

export interface UpdateConsigneIAData {
  consigneId: string;
  pieceId: string; // ID unique de la pièce (ex: "piece_chambre_789")
  consigne: string;
  type: 'ignorer' | 'surveiller';
}

export interface DeleteConsigneIAData {
  consigneId: string;
  pieceId: string; // ID unique de la pièce (ex: "piece_sdb_012")
}

export interface MarkFalsePositiveData {
  pieceId: string; // ID unique de la pièce (ex: "piece_salon_345")
  probleme: string;
}

export interface UpdateSignalementStatusData {
  signalementId: string;
  statut: 'À traiter' | 'Résolu';
}

export interface SelectPhotoReferenceData {
  pieceId: string;
  photoId: string;
}

export interface DeletePhotoData {
  pieceId: string;
  photoId: string;
}

// ============================================
// Union Type pour les Données d'Action
// ============================================

export type ActionData =
  | CreateSignalementData
  | CreateConsigneIAData
  | UpdateConsigneIAData
  | DeleteConsigneIAData
  | MarkFalsePositiveData
  | UpdateSignalementStatusData
  | SelectPhotoReferenceData
  | DeletePhotoData;

// ============================================
// Structure d'une Action
// ============================================

export interface Action<T extends ActionType = ActionType> {
  actionType: T;
  data: T extends 'CREATE_SIGNALEMENT' ? CreateSignalementData
  : T extends 'CREATE_CONSIGNE_IA' ? CreateConsigneIAData
  : T extends 'UPDATE_CONSIGNE_IA' ? UpdateConsigneIAData
  : T extends 'DELETE_CONSIGNE_IA' ? DeleteConsigneIAData
  : T extends 'MARK_FALSE_POSITIVE' ? MarkFalsePositiveData
  : T extends 'UPDATE_SIGNALEMENT_STATUS' ? UpdateSignalementStatusData
  : T extends 'SELECT_PHOTO_REFERENCE' ? SelectPhotoReferenceData
  : T extends 'DELETE_PHOTO' ? DeletePhotoData
  : never;
}

// ============================================
// Requête Complète
// ============================================

export interface EndpointRapportFormRequest {
  rapportId: string;
  version: 'test' | 'live';
  timestamp: string; // ISO 8601
  userId: string;
  actions: Action[];
}

// ============================================
// Réponse de l'API
// ============================================

export interface ActionResult {
  actionType: ActionType;
  status: 'success' | 'error';
  signalementId?: string;
  consigneId?: string;
  error?: string;
}

export interface EndpointRapportFormResponse {
  status: 'success' | 'partial_success' | 'error';
  message: string;
  rapportId: string;
  processedActions: number;
  results: ActionResult[];
  errors: Array<{
    actionIndex: number;
    actionType: ActionType;
    error: string;
  }>;
}

// ============================================
// Helpers pour la Construction des Actions
// ============================================

export const createAction = {
  signalement: (data: CreateSignalementData): Action<'CREATE_SIGNALEMENT'> => ({
    actionType: 'CREATE_SIGNALEMENT',
    data,
  }),

  consigneIA: (data: CreateConsigneIAData): Action<'CREATE_CONSIGNE_IA'> => ({
    actionType: 'CREATE_CONSIGNE_IA',
    data,
  }),

  updateConsigneIA: (data: UpdateConsigneIAData): Action<'UPDATE_CONSIGNE_IA'> => ({
    actionType: 'UPDATE_CONSIGNE_IA',
    data,
  }),

  deleteConsigneIA: (data: DeleteConsigneIAData): Action<'DELETE_CONSIGNE_IA'> => ({
    actionType: 'DELETE_CONSIGNE_IA',
    data,
  }),

  markFalsePositive: (data: MarkFalsePositiveData): Action<'MARK_FALSE_POSITIVE'> => ({
    actionType: 'MARK_FALSE_POSITIVE',
    data,
  }),

  updateSignalementStatus: (data: UpdateSignalementStatusData): Action<'UPDATE_SIGNALEMENT_STATUS'> => ({
    actionType: 'UPDATE_SIGNALEMENT_STATUS',
    data,
  }),

  selectPhotoReference: (data: SelectPhotoReferenceData): Action<'SELECT_PHOTO_REFERENCE'> => ({
    actionType: 'SELECT_PHOTO_REFERENCE',
    data,
  }),

  deletePhoto: (data: DeletePhotoData): Action<'DELETE_PHOTO'> => ({
    actionType: 'DELETE_PHOTO',
    data,
  }),
};

