import { useState } from "react";
import { Button } from "@/components/ui/button";
import RemarquesGenerales from "./rapport/RemarquesGenerales";
import RapportSynthese from "./rapport/RapportSynthese";
import RapportPieceDetail from "./rapport/RapportPieceDetail";
import RapportSuggestions from "./rapport/RapportSuggestions";
import RapportCheckFinal from "./rapport/RapportCheckFinal";
import type { MappedRapportData } from "@/services/rapportDataMapper";
import { X } from "lucide-react";

interface RapportDetailProps {
  rapport: {
    id: string;
    logement: string;
    dateDebut: string;
    dateFin: string;
    statut: "Terminé" | "Expiré" | "En cours";
    parcours: string;
    typeParcours: "voyageur" | "menage";
    etatLieuxMoment: "sortie" | "arrivee-sortie";
    operateur: string;
    etat: number;
  };
  rapportData: MappedRapportData;
}

export default function RapportDetail({
  rapport,
  rapportData
}: RapportDetailProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Utiliser les données réelles du rapportData
  const { synthese, remarquesGenerales, pieces, suggestions, checkFinal } = rapportData;
  const handlePhotoClick = (photo: string) => {
    setSelectedPhoto(photo);
  };

  const handleRoomClick = (roomId: string) => {
    // Scroll vers la section détail par pièce et highlight la pièce correspondante
    const element = document.getElementById(`piece-detail-${roomId.toLowerCase()}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };

  return <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">Rapport Check Easy</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm font-semibold text-foreground">
                {rapport.typeParcours === "voyageur" ? "Voyageur" : "Ménage"}
              </span>
              <span className="text-xs text-muted-foreground">
                ({rapport.etatLieuxMoment === "arrivee-sortie" ? "Arrivée + Sortie" : "Sortie uniquement"})
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-12">
          {/* Synthèse - En haut */}
          <RapportSynthese rapport={synthese} />

          {/* Remarques générales */}
          <RemarquesGenerales data={remarquesGenerales} onRoomClick={handleRoomClick} />

          {/* Détail par pièce */}
          <div className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold text-foreground">Détail par Pièce</h2>

            </div>
            {pieces.map(piece => <div key={piece.id} id={`piece-detail-${piece.nom.toLowerCase()}`}>
                <RapportPieceDetail piece={piece} onPhotoClick={handlePhotoClick} />
              </div>)}
          </div>

          {/* Check final - Afficher seulement s'il y a des items */}
          {checkFinal.length > 0 && (
            <RapportCheckFinal checkItems={checkFinal} onPhotoClick={handlePhotoClick} />
          )}

          {/* Suggestions IA */}
          <RapportSuggestions suggestions={suggestions} />
        </div>
      </div>

      {/* Modal pour afficher les photos en grand */}
      {selectedPhoto && <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]" onClick={() => setSelectedPhoto(null)}>
          <div className="max-w-4xl max-h-[90vh]">
            <img src={selectedPhoto} alt="Photo en grand" className="w-full h-full object-contain rounded-lg" />
          </div>
          <Button variant="ghost" size="sm" className="absolute top-4 right-4 text-white hover:bg-white/20" onClick={() => setSelectedPhoto(null)}>
            <X className="h-5 w-5" />
          </Button>
        </div>}
    </div>;
}