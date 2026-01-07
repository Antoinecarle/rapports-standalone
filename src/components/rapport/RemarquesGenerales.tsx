import { useState } from "react";
import { Package, Wrench, Sparkles, AlertCircle, Search, Filter, ChevronRight, Home, Calendar, Camera, Eye, ExternalLink, Clock, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { isValidDate } from "@/utils/dateUtils";
interface RemarquesGeneralesData {
  scope: "logement";
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
    wrong_room_rooms?: string[];
    image_quality_rooms?: string[];
  };
  highlights: Array<{
    text: string;
    titre: string;
    severite: 'faible' | 'moyenne' | 'elevee';
    pieceName: string;
  }>;
  user_reports: Array<{
    text: string;
    status: "confirmé" | "non_verifiable" | "non_confirmé";
    room: string;
    roomName?: string; // Nom de la pièce résolu depuis l'ID
    // Données enrichies depuis l'API Bubble
    typeText?: string;
    img_url?: string | null;
    signaleur?: {
      nom: string;
      prenom: string;
      phone: string;
    };
    created_at?: string;
    updated_at?: string;
    OS_signalementStatut?: string;
  }>;
  rooms: Array<{
    name: string;
    icon: string;
    status: "ok" | "attention" | "probleme";
    issues_summary: {
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
    flags: string[];
    link: string;
  }>;
}
interface RemarquesGeneralesProps {
  data: RemarquesGeneralesData;
  onRoomClick: (roomId: string) => void;
}

// Mock data selon vos spécifications
const mockData: RemarquesGeneralesData = {
  scope: "logement",
  meta: {
    logementId: "6 rue Albert Di fusco",
    rapportId: "RPT-2024-001",
    dateGeneration: "30/07/2024",
    heureGeneration: "09:40",
    photosCheckin: 12,
    photosCheckout: 15
  },
  counts: {
    missing_item: 4,
    added_item: 2,
    positioning: 3,
    cleanliness: {
      high: 1,
      medium: 2,
      low: 3
    },
    damage: {
      high: 0,
      medium: 1,
      low: 1
    },
    image_quality: 1,
    wrong_room: 1
  },
  alerts: {
    wrong_room: true,
    image_quality: true,
    wrong_room_rooms: ["Salon", "Chambre 2"],
    image_quality_rooms: ["Salle d'eau"]
  },
  highlights: ["Tâche non validée : Laissez la cuisine propre et rangée, comme à votre arrivée — Cuisine", "Dégradation : Calcaire marqué paroi douche — Salle d'eau", "Agencement : Wrong room détecté — Chambre 4", "Objet manquant : Télécommande TV — Salon", "Objet ajouté : Sac personnel oublié — Cuisine", "Agencement : Plusieurs coussins déplacés — Terrasse"],
  user_reports: [{
    text: "Poignée entrée cassée",
    status: "confirmé",
    room: "Entrée"
  }, {
    text: "Robinet qui goutte",
    status: "non_verifiable",
    room: "Salle d'eau"
  }, {
    text: "Ampoule grillée salon",
    status: "non_confirmé",
    room: "Salon"
  }],
  rooms: [{
    name: "Salon",
    icon: "🛋️",
    status: "probleme",
    issues_summary: {
      missing_item: 2,
      added_item: 0,
      positioning: 1,
      cleanliness: {
        high: 0,
        medium: 1,
        low: 0
      },
      damage: {
        high: 0,
        medium: 0,
        low: 1
      },
      image_quality: 0,
      wrong_room: 1
    },
    flags: ["wrong_room"],
    link: "/rapport/123/piece/salon"
  }, {
    name: "Cuisine",
    icon: "🍽️",
    status: "attention",
    issues_summary: {
      missing_item: 0,
      added_item: 2,
      positioning: 1,
      cleanliness: {
        high: 0,
        medium: 1,
        low: 0
      },
      damage: {
        high: 0,
        medium: 0,
        low: 0
      },
      image_quality: 0,
      wrong_room: 0
    },
    flags: [],
    link: "/rapport/123/piece/cuisine"
  }, {
    name: "Salle d'eau",
    icon: "🚿",
    status: "attention",
    issues_summary: {
      missing_item: 0,
      added_item: 0,
      positioning: 1,
      cleanliness: {
        high: 1,
        medium: 0,
        low: 0
      },
      damage: {
        high: 0,
        medium: 1,
        low: 0
      },
      image_quality: 1,
      wrong_room: 0
    },
    flags: ["qualité"],
    link: "/rapport/123/piece/salle-eau"
  }, {
    name: "Terrasse",
    icon: "🌿",
    status: "ok",
    issues_summary: {
      missing_item: 2,
      added_item: 0,
      positioning: 0,
      cleanliness: {
        high: 0,
        medium: 0,
        low: 2
      },
      damage: {
        high: 0,
        medium: 0,
        low: 0
      },
      image_quality: 0,
      wrong_room: 0
    },
    flags: [],
    link: "/rapport/123/piece/terrasse"
  }]
};
export default function RemarquesGenerales({
  data = mockData,
  onRoomClick
}: RemarquesGeneralesProps) {
  const {
    toast
  } = useToast();
  const [filtreActif, setFiltreActif] = useState<string>("tous");
  const [recherche, setRecherche] = useState("");
  const [chipActif, setChipActif] = useState<string | null>(null);
  const [statutsTraitement, setStatutsTraitement] = useState<Record<number, "À traiter" | "Résolu">>(Object.fromEntries(data.user_reports.map((_, index) => [index, "À traiter"])));

  // Filtrage des pièces
  const piecesFiltrees = data.rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(recherche.toLowerCase());
    const matchesFilter = filtreActif === "tous" || filtreActif === "critiques" && room.status === "probleme" || filtreActif === "objets" && room.issues_summary.missing_item + room.issues_summary.added_item + room.issues_summary.positioning > 0 || filtreActif === "propreté" && room.issues_summary.cleanliness.high + room.issues_summary.cleanliness.medium + room.issues_summary.cleanliness.low > 0 || filtreActif === "dégradations" && room.issues_summary.damage.high + room.issues_summary.damage.medium + room.issues_summary.damage.low > 0 || filtreActif === "wrong_room" && room.issues_summary.wrong_room > 0 || filtreActif === "qualité" && room.issues_summary.image_quality > 0;
    return matchesSearch && matchesFilter;
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case "probleme":
        return "text-destructive bg-destructive/10 border-destructive/20";
      case "attention":
        return "text-warning bg-warning/10 border-warning/20";
      case "ok":
        return "text-success bg-success/10 border-success/20";
      default:
        return "text-muted-foreground bg-muted/10 border-border";
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case "probleme":
        return "Problème";
      case "attention":
        return "Attention";
      case "ok":
        return "OK";
      default:
        return status;
    }
  };
  const handleStatutChange = (index: number, newStatut: "À traiter" | "Résolu") => {
    setStatutsTraitement(prev => ({
      ...prev,
      [index]: newStatut
    }));
    toast({
      title: "Statut mis à jour",
      description: `Le signalement a été marqué comme "${newStatut}".`
    });
  };

  // Fonctions helper pour la sévérité
  const getSeveriteIcon = (severite: 'faible' | 'moyenne' | 'elevee') => {
    switch (severite) {
      case 'elevee':
        return <AlertTriangle className="w-4 h-4" />;
      case 'moyenne':
        return <AlertCircle className="w-4 h-4" />;
      case 'faible':
        return <Info className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getSeveriteBadgeStyle = (severite: 'faible' | 'moyenne' | 'elevee') => {
    switch (severite) {
      case 'elevee':
        return "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400";
      case 'moyenne':
        return "bg-warning text-warning-foreground";
      case 'faible':
        return "bg-info text-info-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getSeveriteLabel = (severite: 'faible' | 'moyenne' | 'elevee') => {
    switch (severite) {
      case 'elevee':
        return "Élevée";
      case 'moyenne':
        return "Moyenne";
      case 'faible':
        return "Faible";
      default:
        return "Inconnue";
    }
  };

  return <div className="space-y-8">
    {/* A. En-tête */}
    <div className="space-y-4">
      <div>


      </div>

      {/* Méta informations */}

    </div>

    {/* B. Bannière Alerte */}
    {(data.alerts.wrong_room || data.alerts.image_quality) && <Alert className="border-[#f5e6d3] bg-[#fef8f0]">
      <AlertCircle className="h-5 w-5 text-[#d97706]" />
      <AlertDescription>
        <div className="space-y-2">
          <strong className="text-[#d97706] block">Problèmes d'analyse photos   </strong>
          <ul className="space-y-1 text-sm text-[#92400e]">
            {data.alerts.wrong_room && <li>• Photos non conformes : {data.alerts.wrong_room_rooms?.join(", ")}</li>}
            {data.alerts.image_quality && <li>• Qualité insuffisante : {data.alerts.image_quality_rooms?.join(", ")}</li>}
          </ul>
        </div>
      </AlertDescription>
    </Alert>}

    {/* C. Compteurs agrégés */}


    {/* D. Faits saillants */}
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Faits important analysés par l'IA      </h3>
      <div className="space-y-3">
        {data.highlights.map((highlight, index) => {
          // Extraire le type de fait (avant les ":")
          const typeFait = highlight.titre.split(':')[0].trim();

          return <div key={index} className="flex items-start gap-2 md:gap-3 p-2.5 md:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => {
            if (highlight.pieceName && onRoomClick) {
              onRoomClick(highlight.pieceName);
            }
          }}>
            <div className={`flex items-center justify-center ${getSeveriteBadgeStyle(highlight.severite)} rounded-full p-1 md:p-1.5 mt-0.5 shrink-0`}>
              {getSeveriteIcon(highlight.severite)}
            </div>
            <div className="flex-1 min-w-0">
              {/* Type de fait signalé */}
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  {typeFait}
                </p>
                <Badge variant="outline" className={`text-xs ${getSeveriteBadgeStyle(highlight.severite)} shrink-0`}>
                  {getSeveriteLabel(highlight.severite)}
                </Badge>
              </div>
              {/* Description complète du problème */}
              <p className="font-medium text-xs md:text-sm whitespace-pre-wrap break-words">{highlight.text}</p>
              <p className="text-xs text-muted-foreground mt-1">— {highlight.pieceName}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 hidden sm:block" />
          </div>
        })}
      </div>
    </Card>

    {/* E. Signalements utilisateurs */}
    {data.user_reports.length > 0 && <Card className="p-4 md:p-6">
      <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">Signalements utilisateurs :      </h3>
      <div className="space-y-3 md:space-y-4">
        {data.user_reports.map((report, index) => <div key={index} className="p-3 md:p-4 rounded-lg bg-muted/30 space-y-2 md:space-y-3">
          {/* En-tête avec type et statut */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {report.typeText || 'Signalement'}
              </Badge>
              <span className="text-sm text-muted-foreground">Pièce: {report.roomName || report.room}</span>
            </div>
            <Select value={statutsTraitement[index]} onValueChange={value => handleStatutChange(index, value as "À traiter" | "Résolu")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="À traiter">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>À traiter</span>
                  </div>
                </SelectItem>
                <SelectItem value="Résolu">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Résolu</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <p className="text-sm">{report.text}</p>

          {/* Photo si disponible */}
          {report.img_url && <div className="mt-2">
            <img
              src={report.img_url.startsWith('//') ? `https:${report.img_url}` : report.img_url}
              alt="Photo du signalement"
              className="rounded-lg w-full sm:max-w-xs max-h-48 sm:max-h-64 object-cover border border-border"
            />
          </div>}

          {/* Informations du signaleur */}
          {report.signaleur && <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
            <span>Signalé par: {report.signaleur.prenom} {report.signaleur.nom}</span>
            <span>•</span>
            <span>{report.signaleur.phone}</span>
            {isValidDate(report.created_at) && <>
              <span>•</span>
              <span>{new Date(report.created_at).toLocaleDateString('fr-FR')}</span>
            </>}
          </div>}
        </div>)}
      </div>
    </Card>}

    {/* F. Répartition par pièce */}

  </div>;
}