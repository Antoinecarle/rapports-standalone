/**
 * Service pour interagir avec l'endpoint API universel
 * Endpoint: /api/1.1/wf/endpointrapportform/initialize
 */

import { apiConfig } from '@/config/api.config';
import type {
  EndpointRapportFormRequest,
  EndpointRapportFormResponse,
  Action,
  CreateSignalementData,
  CreateConsigneIAData,
  UpdateConsigneIAData,
  DeleteConsigneIAData,
  MarkFalsePositiveData,
  UpdateSignalementStatusData,
  SelectPhotoReferenceData,
  DeletePhotoData,
} from '@/types/endpoint.types';

class EndpointRapportFormService {
  private readonly endpointName = 'endpointrapportform';

  /**
   * Envoie une ou plusieurs actions à l'endpoint universel
   */
  async sendActions(
    rapportId: string,
    userId: string,
    actions: Action[]
  ): Promise<EndpointRapportFormResponse> {
    try {
      const url = apiConfig.buildUrl(this.endpointName, {});

      const request: EndpointRapportFormRequest = {
        rapportId,
        version: apiConfig.getVersion(),
        timestamp: new Date().toISOString(),
        userId,
        actions,
      };

      console.log('[EndpointRapportFormService] Envoi des actions:', {
        rapportId,
        userId,
        actionsCount: actions.length,
        url,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      console.log('[EndpointRapportFormService] Réponse brute reçue:', rawData);

      // Adapter la réponse de Bubble au format attendu
      const data: EndpointRapportFormResponse = {
        status: rawData.status === 'success' ? 'success' : 'error',
        message: rawData.response?.sucess ? 'Actions traitées avec succès' : 'Erreur lors du traitement',
        rapportId: rapportId,
        processedActions: rawData.response?.sucess ? actions.length : 0,
        results: [],
        errors: []
      };

      console.log('[EndpointRapportFormService] Réponse adaptée:', {
        status: data.status,
        processedActions: data.processedActions,
        errors: data.errors.length,
      });

      return data;
    } catch (error) {
      console.error('[EndpointRapportFormService] Erreur lors de l\'envoi des actions:', error);
      throw error;
    }
  }

  /**
   * Créer un signalement
   */
  async createSignalement(
    rapportId: string,
    userId: string,
    data: CreateSignalementData
  ): Promise<EndpointRapportFormResponse> {
    try {
      const url = apiConfig.buildUrl('endpointrapportformsignalement', {});

      // Adapter les noms de champs pour Bubble
      const bubbleData = {
        rapportId,
        version: apiConfig.getVersion(),
        timestamp: new Date().toISOString(),
        userId,
        Piece: data.pieceId,
        description: data.commentaire,
        probleme: data.probleme,
        // Envoyer l'image en base64 (extraire le base64 du data URL si nécessaire)
        photo: data.photoBase64 ? this.extractBase64FromDataUrl(data.photoBase64) : null,
        // Ajouter l'ID de l'étape si disponible
        ...(data.etapeId && { etapeId: data.etapeId })
      };

      console.log('[EndpointRapportFormService] Création signalement avec données adaptées:', {
        ...bubbleData,
        photo: bubbleData.photo ? `[base64 data - ${bubbleData.photo.substring(0, 50)}...]` : null
      });
      console.log('[EndpointRapportFormService] URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(bubbleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      console.log('[EndpointRapportFormService] Réponse brute reçue:', rawData);

      // Adapter la réponse de Bubble au format attendu
      const result: EndpointRapportFormResponse = {
        status: rawData.status === 'success' ? 'success' : 'error',
        message: rawData.response?.sucess ? 'Signalement créé avec succès' : 'Erreur lors de la création',
        rapportId: rapportId,
        processedActions: rawData.response?.sucess ? 1 : 0,
        results: [],
        errors: []
      };

      console.log('[EndpointRapportFormService] Signalement créé avec succès');

      return result;
    } catch (error) {
      console.error('[EndpointRapportFormService] Erreur lors de la création du signalement:', error);
      throw error;
    }
  }

  /**
   * Extrait le base64 d'un data URL (ex: "data:image/jpeg;base64,/9j/4AAQ...")
   * Retourne uniquement la partie base64 sans le préfixe
   */
  private extractBase64FromDataUrl(dataUrl: string): string {
    if (dataUrl.startsWith('data:')) {
      const base64Index = dataUrl.indexOf('base64,');
      if (base64Index !== -1) {
        return dataUrl.substring(base64Index + 7);
      }
    }
    return dataUrl;
  }

  /**
   * Créer une consigne IA
   */
  async createConsigneIA(
    rapportId: string,
    userId: string,
    data: CreateConsigneIAData
  ): Promise<EndpointRapportFormResponse> {
    try {
      const url = apiConfig.buildUrl('endpointrapportformconsigne', {});

      // Adapter les noms de champs pour Bubble
      const bubbleData = {
        rapportId,
        version: apiConfig.getVersion(),
        timestamp: new Date().toISOString(),
        userId,
        Piece: data.pieceId,
        Commentaire: data.consigne,
        os_consigneType: data.type,
        ...(data.probleme && { probleme: data.probleme })
      };

      console.log('[EndpointRapportFormService] Création consigne IA avec données adaptées:', bubbleData);
      console.log('[EndpointRapportFormService] URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(bubbleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      console.log('[EndpointRapportFormService] Réponse brute reçue:', rawData);

      // Adapter la réponse de Bubble au format attendu
      const result: EndpointRapportFormResponse = {
        status: rawData.status === 'success' ? 'success' : 'error',
        message: rawData.response?.sucess ? 'Consigne IA créée avec succès' : 'Erreur lors de la création',
        rapportId: rapportId,
        processedActions: rawData.response?.sucess ? 1 : 0,
        results: [],
        errors: []
      };

      console.log('[EndpointRapportFormService] Consigne IA créée avec succès');

      return result;
    } catch (error) {
      console.error('[EndpointRapportFormService] Erreur lors de la création de la consigne IA:', error);
      throw error;
    }
  }

  /**
   * Modifier une consigne IA
   */
  async updateConsigneIA(
    rapportId: string,
    userId: string,
    data: UpdateConsigneIAData
  ): Promise<EndpointRapportFormResponse> {
    return this.sendActions(rapportId, userId, [
      {
        actionType: 'UPDATE_CONSIGNE_IA',
        data,
      },
    ]);
  }

  /**
   * Supprimer une consigne IA
   */
  async deleteConsigneIA(
    rapportId: string,
    userId: string,
    data: DeleteConsigneIAData
  ): Promise<EndpointRapportFormResponse> {
    return this.sendActions(rapportId, userId, [
      {
        actionType: 'DELETE_CONSIGNE_IA',
        data,
      },
    ]);
  }

  /**
   * Marquer comme faux positif
   */
  async markFalsePositive(
    rapportId: string,
    userId: string,
    data: MarkFalsePositiveData
  ): Promise<EndpointRapportFormResponse> {
    // Adapter les noms de champs pour Bubble
    const bubbleData = {
      Piece: data.pieceId,
      probleme: data.probleme
    };

    console.log('[EndpointRapportFormService] Marquage faux positif avec données adaptées:', bubbleData);

    return this.sendActions(rapportId, userId, [
      {
        actionType: 'MARK_FALSE_POSITIVE',
        data: bubbleData as any, // Type assertion car Bubble attend des noms de champs différents
      },
    ]);
  }

  /**
   * Mettre à jour le statut d'un signalement
   */
  async updateSignalementStatus(
    rapportId: string,
    userId: string,
    data: UpdateSignalementStatusData
  ): Promise<EndpointRapportFormResponse> {
    return this.sendActions(rapportId, userId, [
      {
        actionType: 'UPDATE_SIGNALEMENT_STATUS',
        data,
      },
    ]);
  }

  /**
   * Sélectionner une photo de référence
   */
  async selectPhotoReference(
    rapportId: string,
    userId: string,
    data: SelectPhotoReferenceData
  ): Promise<EndpointRapportFormResponse> {
    return this.sendActions(rapportId, userId, [
      {
        actionType: 'SELECT_PHOTO_REFERENCE',
        data,
      },
    ]);
  }

  /**
   * Supprimer une photo
   */
  async deletePhoto(
    rapportId: string,
    userId: string,
    data: DeletePhotoData
  ): Promise<EndpointRapportFormResponse> {
    return this.sendActions(rapportId, userId, [
      {
        actionType: 'DELETE_PHOTO',
        data,
      },
    ]);
  }

  /**
   * Marquer un signalement comme traité
   */
  async markSignalementTraite(
    signalementId: string
  ): Promise<EndpointRapportFormResponse> {
    try {
      const url = apiConfig.buildUrl('signalementendpointtraite', {});

      const payload = {
        signalementId
      };

      console.log('[EndpointRapportFormService] Marquage signalement comme traité:', payload);
      console.log('[EndpointRapportFormService] URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const rawData = await response.json();

      console.log('[EndpointRapportFormService] Réponse brute reçue:', rawData);

      // Adapter la réponse de Bubble au format attendu
      const result: EndpointRapportFormResponse = {
        status: rawData.status === 'success' ? 'success' : 'error',
        message: rawData.response?.sucess ? 'Signalement marqué comme traité' : 'Erreur lors du traitement',
        rapportId: '',
        processedActions: rawData.response?.sucess ? 1 : 0,
        results: [],
        errors: []
      };

      console.log('[EndpointRapportFormService] Signalement marqué comme traité avec succès');

      return result;
    } catch (error) {
      console.error('[EndpointRapportFormService] Erreur lors du marquage du signalement comme traité:', error);
      throw error;
    }
  }
}

export const endpointRapportFormService = new EndpointRapportFormService();

