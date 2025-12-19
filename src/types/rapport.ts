export interface PhotoReference {
  id: string;
  url: string;
  date: string;
  source: 'reference' | 'voyageur' | 'agent' | 'proprietaire';
  pieceId: string;
  isSelected?: boolean;
}

export interface PiecePhotos {
  pieceId: string;
  pieceNom: string;
  pieceIcon: string;
  photos: PhotoReference[];
  photoReferenceActive: string; // ID de la photo sélectionnée
  statut?: string;
}

export interface ModifierPhotosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rapportId: string;
  nomOperateur: string;
  dateDebut: string;
  dateFin: string;
  telephone?: string;
  pieces: PiecePhotos[];
  onSave: (pieces: PiecePhotos[]) => void;
}
