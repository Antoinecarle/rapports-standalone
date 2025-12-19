/**
 * Types pour la structure complète du fichier data.json
 * Ces types représentent la structure des données brutes du backend
 */

export interface ReportMetadata {
  id: string;
  logement: string;
  dateDebut: string;
  dateFin: string;
  statut: "Terminé" | "Expiré" | "En cours";
  parcours: string;
  typeParcours: "voyageur" | "menage";
  etatLieuxMoment: "sortie" | "arriveeSortie";
  operateur: string;
  etat: number;
  dateGeneration: string;
  heureGeneration: string;
}

export interface SousNotes {
  presenceObjets: number;
  etatObjets: number;
  proprete: number;
  agencement: number;
}

export interface RemarquesGenerales {
  objetsManquants: string[];
  degradations: string[];
  propreteAgencement: string[];
  signalements: string[];
}

export interface SyntheseSection {
  logement: string;
  voyageur: string;
  email: string;
  telephone: string;
  dateDebut: string;
  dateFin: string;
  heureCheckin: string;
  heureCheckout: string;
  heureCheckinFin: string;
  heureCheckoutFin: string;
  noteGenerale: number;
  sousNotes: SousNotes;
  statut: string;
  remarquesGenerales: RemarquesGenerales;
}

export interface IssuesSummary {
  missing_item: number;
  added_item: number;
  positioning: number;
  cleanliness: {
    high: number;
    medium: number;
    low: number;
  };
  damage: {
    high: number;
    medium: number;
    low: number;
  };
  image_quality: number;
  wrong_room: number;
}

export interface RoomSummary {
  name: string;
  icon: string;
  status: "ok" | "attention" | "probleme";
  issues_summary: IssuesSummary;
  flags: string[];
  link: string;
}

export interface RemarquesGeneralesSection {
  scope: string;
  meta: {
    logementId: string;
    rapportId: string;
    dateGeneration: string;
    heureGeneration: string;
    photosCheckin: number;
    photosCheckout: number;
  };
  counts: {
    missing_item: number;
    added_item: number;
    positioning: number;
    cleanliness: {
      high: number;
      medium: number;
      low: number;
    };
    damage: {
      high: number;
      medium: number;
      low: number;
    };
    image_quality: number;
    wrong_room: number;
  };
  alerts: {
    wrong_room: boolean;
    image_quality: boolean;
    wrong_room_rooms: string[];
    image_quality_rooms: string[];
  };
  highlights: string[];
  user_reports: Array<{
    text: string;
    status: "confirmé" | "non_verifiable" | "non_confirmé";
    room: string;
  }>;
  rooms: RoomSummary[];
}

export interface TacheValidee {
  nom: string;
  estApprouve: boolean;
  dateHeureValidation: string;
  commentaire?: string | null;
  photo_url?: string; // URL de la photo associée à la tâche (si disponible)
}

export interface Probleme {
  id: string;
  titre: string;
  description: string;
  severite: "faible" | "moyenne" | "elevee";
  detectionIA: boolean;
  consignesIA?: string[];
  estFaux?: boolean;
}

export interface CheckEntree {
  estConforme: boolean;
  dateHeureValidation: string;
  photosReprises?: string[];
  photosEntree?: string[]; // Photos capturées lors du check d'entrée
}

export interface CheckSortie {
  estValide: boolean;
  dateHeureValidation: string;
  photosSortie: string[];
  photosNonConformes?: string[];
}

export interface PieceDetail {
  id: string;
  nom: string;
  pieceIcon: string;
  note: number;
  resume: string;
  photosReference: string[];
  checkEntree: CheckEntree;
  checkSortie: CheckSortie;
  tachesValidees: TacheValidee[];
  problemes: Probleme[];
  consignesIA: string[];
}

export interface CheckFinalItem {
  id?: string;
  text: string;
  completed: boolean;
  icon?: string;
}

export interface SuggestionIA {
  titre: string;
  description: string;
  priorite: "haute" | "moyenne" | "basse";
}

export interface UILabels {
  header: {
    title: string;
    closeButton: string;
  };
  syntheseSection: {
    title: string;
    voyageurTitle: string;
    checkEntreeTitle: string;
    checkSortieTitle: string;
    noteGeneraleTitle: string;
    presenceObjetsLabel: string;
    etatObjetsLabel: string;
    propreteLabel: string;
    agencementLabel: string;
    debutLabel: string;
    finLabel: string;
  };
  remarquesGeneralesSection: {
    title: string;
    alerteTitle: string;
    photosNonConformesLabel: string;
    qualiteInsuffisanteLabel: string;
    faitsSaillantsTitle: string;
    signalementsUtilisateursTitle: string;
    aTraiterLabel: string;
    resoluLabel: string;
  };
  detailParPieceSection: {
    title: string;
    photosReferenceLabel: string;
    etatLieuxEntreeLabel: string;
    etatLieuxSortieLabel: string;
    conformeLabel: string;
    nonConformeLabel: string;
    valideLabel: string;
    nonValideLabel: string;
    tachesRealisees: string;
    commentaireGlobalLabel: string;
    faitsSignalesIATitle: string;
    consignesIATitle: string;
    aIgnorerLabel: string;
    aSurveillerLabel: string;
    ajouterButton: string;
    modifierButton: string;
    supprimerButton: string;
    creerSignalementButton: string;
    ajouterConsigneIAButton: string;
    marquerCommeFauxButton: string;
  };
  checkFinalSection: {
    title: string;
  };
  suggestionsIASection: {
    title: string;
  };
  badges: {
    tacheNonRealisee: string;
    faitSignale: string;
    signalementCree: string;
    consigneIAAjoutee: string;
    marqueCommeFaux: string;
  };
  severite: {
    faible: string;
    moyenne: string;
    elevee: string;
  };
  status: {
    ok: string;
    attention: string;
    probleme: string;
    termine: string;
    expire: string;
    enCours: string;
  };
  typeParcours: {
    voyageur: string;
    menage: string;
  };
  etatLieuxMoment: {
    sortie: string;
    arriveeSortie: string;
  };
}

/**
 * Structure complète du fichier data.json
 */
export interface RapportDataJSON {
  reportMetadata: ReportMetadata;
  syntheseSection: SyntheseSection;
  remarquesGeneralesSection: RemarquesGeneralesSection;
  detailParPieceSection: PieceDetail[];
  checkFinalSection: CheckFinalItem[];
  suggestionsIASection: SuggestionIA[];
  uiLabels: UILabels;
}

