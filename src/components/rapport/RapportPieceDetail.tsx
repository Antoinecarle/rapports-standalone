import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Star, CheckCircle, XCircle, AlertTriangle, MessageSquare, Lightbulb, Image as ImageIcon, AlertCircle, X, MoreVertical, Pencil, Trash2, Bot, Info } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { endpointRapportFormService } from "@/services/endpointRapportFormService";
import { formatDate as formatDateUtil, formatConsigneDate, isValidDate } from "@/utils/dateUtils";
interface TacheValidation {
  nom: string;
  estApprouve: boolean;
  dateHeureValidation: string;
  commentaire?: string;
  photo_url?: string;
  photo_reference_url?: string;
  etapeId?: string;
}
interface PieceData {
  id: string;
  nom: string;
  pieceIcon: string;
  note: number;
  photosReference: string[];
  checkEntree?: {
    estConforme: boolean;
    dateHeureValidation: string;
    photosEntree?: string[];
    photosReprises?: string[];
  };
  checkSortie?: {
    estValide: boolean;
    dateHeureValidation: string;
    photosSortie: (string | { url: string; datephoto?: string })[];
    photosNonConformes?: string[];
  };
  resume: string;
  tachesValidees: TacheValidation[];
  problemes: {
    id: string;
    titre: string;
    description: string;
    severite: 'faible' | 'moyenne' | 'elevee';
    detectionIA: boolean;
    consignesIA?: string[];
    estFaux?: boolean;
    etapeId?: string;
  }[];
  consignesIA: (string | {
    type: 'ignorer' | 'surveiller';
    consigne: string;
  })[];
  consignesIABubble?: {
    _id: string;
    Commentaire: string;
    "Created By": string;
    "Created Date": number;
    "Modified Date": number;
    Piece?: string;
    os_consigneType?: "ignorer" | "surveiller";
    REF?: string;
    probleme?: string;
  }[];
  rawData?: {
    etapes?: any[];
    signalements?: any[];
    signalementsUtilisateur?: any[];
    signalementsIA?: any[];
  };
}
interface RapportPieceDetailProps {
  piece: PieceData;
  onPhotoClick: (photo: string) => void;
  rapportId: string;
  userId?: string;
  onReload?: () => void;
}

const renderStars = (count: number) => {
  return <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < count ? 'fill-primary text-primary' : 'text-gray-300'}`} />)}
  </div>;
};
export default function RapportPieceDetail({
  piece,
  onPhotoClick,
  rapportId,
  userId = 'default-user',
  onReload
}: RapportPieceDetailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [signalementDialogOpen, setSignalementDialogOpen] = useState(false);
  const [consigneDialogOpen, setConsigneDialogOpen] = useState(false);
  const [fauxDialogOpen, setFauxDialogOpen] = useState(false);
  const [problemeSelectionne, setProblemeSelectionne] = useState("");
  const [problemeIdSelectionne, setProblemeIdSelectionne] = useState<string | null>(null); // ID de l'étape du problème
  const [problemeIndex, setProblemeIndex] = useState(-1);
  const [commentaireSignalement, setCommentaireSignalement] = useState("");
  const [photoSignalement, setPhotoSignalement] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // État local pour les consignes IA (pour mise à jour optimiste)
  const [localConsignesIA, setLocalConsignesIA] = useState(piece.consignesIABubble || []);
  const [nouvelleConsigneIA, setNouvelleConsigneIA] = useState("");
  const [problemesMarquesFaux, setProbleresMarquesFaux] = useState<number[]>([]);
  const [problemesAvecSignalement, setProbleresAvecSignalement] = useState<number[]>([]);
  const [problemesAvecConsigne, setProbleresAvecConsigne] = useState<number[]>([]);
  const [typeConsigne, setTypeConsigne] = useState<"ignorer" | "surveiller">("ignorer");
  const [editingConsigneIndex, setEditingConsigneIndex] = useState<number | null>(null);

  // État local pour les signalements (pour mise à jour optimiste)
  const [localSignalements, setLocalSignalements] = useState(piece.rawData?.signalementsUtilisateur || []);

  const {
    toast
  } = useToast();

  // Synchroniser l'état local avec les props quand elles changent
  useEffect(() => {
    setLocalConsignesIA(piece.consignesIABubble || []);
  }, [piece.consignesIABubble]);

  useEffect(() => {
    setLocalSignalements(piece.rawData?.signalementsUtilisateur || []);
  }, [piece.rawData?.signalementsUtilisateur]);

  // Fonction helper pour obtenir l'icône de sévérité
  const getSeveriteIcon = (severite: 'faible' | 'moyenne' | 'elevee') => {
    switch (severite) {
      case 'elevee':
        return <AlertTriangle className="w-3 h-3" />;
      case 'moyenne':
        return <AlertCircle className="w-3 h-3" />;
      case 'faible':
        return <Info className="w-3 h-3" />;
      default:
        return <Info className="w-3 h-3" />;
    }
  };

  // Fonction helper pour obtenir le style du badge de sévérité
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

  // Fonction helper pour obtenir le label de sévérité
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

  // Fonction helper pour vérifier si une tâche a des problèmes détectés par l'IA
  const tacheHasProblems = (tache: TacheValidation): boolean => {
    if (!tache.etapeId) return false;

    // Vérifier si l'etapeId de la tâche correspond à un problème détecté par l'IA
    return piece.problemes.some(probleme =>
      probleme.etapeId === tache.etapeId &&
      probleme.detectionIA &&
      !probleme.estFaux // Ignorer les faux positifs
    );
  };

  // Fonction helper pour récupérer la photo associée à un problème
  const getProblemePhoto = (probleme: { etapeId?: string; titre: string; description: string }): string | null => {
    console.log('[getProblemePhoto] Recherche photo pour problème:', probleme.description, '| etapeId:', probleme.etapeId || 'AUCUN');

    // Stratégie 1 : Si le problème a un etapeId, chercher la tâche correspondante dans tachesValidees
    // Les etapeId de dataia correspondent aux etapeId des tâches (pas aux etapeid de fulldata)
    if (probleme.etapeId) {
      console.log('[getProblemePhoto] 🔍 Recherche par etapeId:', probleme.etapeId);
      console.log('[getProblemePhoto] 📋 Tâches disponibles:', piece.tachesValidees.map(t => ({ nom: t.nom, etapeId: t.etapeId, hasPhoto: !!t.photo_url })));

      const tacheParEtapeId = piece.tachesValidees.find(tache => tache.etapeId === probleme.etapeId);
      if (tacheParEtapeId?.photo_url) {
        console.log('[getProblemePhoto] ✅ Photo trouvée via etapeId dans tachesValidees:', tacheParEtapeId.nom);
        return tacheParEtapeId.photo_url;
      } else {
        console.log('[getProblemePhoto] ⚠️ Tâche trouvée mais sans photo ou tâche non trouvée');
      }

      // Fallback : chercher aussi dans rawData.etapes si disponible
      if (piece.rawData?.etapes) {
        const etape = piece.rawData.etapes.find(e => e.etape_id === probleme.etapeId);
        if (etape) {
          const photoEtape = etape.photo_url || etape.photo_base64;
          if (photoEtape) {
            console.log('[getProblemePhoto] ✅ Photo trouvée via etapeId dans rawData.etapes');
            return photoEtape;
          }
        }
      }
    }

    // Stratégie 2 : Si le problème commence par [ÉTAPE], extraire le nom de la tâche et chercher par nom
    if (probleme.description.startsWith('[ÉTAPE]')) {
      // Le format typique est "[ÉTAPE] description du problème liée à la tâche"
      // Chercher une tâche dont le nom correspond à des mots-clés de la description
      const descSansPrefix = probleme.description.replace('[ÉTAPE]', '').trim().toLowerCase();

      // Chercher par mots-clés significatifs
      const motsCles = descSansPrefix
        .replace(/[^\w\sàâäéèêëïîôùûüÿæœç]/g, ' ')
        .split(/\s+/)
        .filter(mot => mot.length > 4);

      const tacheParMotsCles = piece.tachesValidees
        .filter(tache => tache.photo_url)
        .find(tache => {
          const tacheNomLower = tache.nom.toLowerCase();
          // Chercher si au moins un mot-clé significatif est présent dans le nom de la tâche
          return motsCles.some(mot => tacheNomLower.includes(mot));
        });

      if (tacheParMotsCles?.photo_url) {
        console.log('[getProblemePhoto] ✅ Photo trouvée via mots-clés [ÉTAPE]:', tacheParMotsCles.nom);
        return tacheParMotsCles.photo_url;
      }
    }

    // Stratégie 3 : Chercher la tâche dont le commentaire contient exactement ce problème
    // Les commentaires des tâches contiennent les problèmes détectés par l'IA
    const tacheAvecProbleme = piece.tachesValidees.find(tache => {
      if (!tache.commentaire || !tache.photo_url) return false;

      // Vérifier si le commentaire de la tâche contient la description du problème
      const commentaireLower = tache.commentaire.toLowerCase();
      const descriptionLower = probleme.description.toLowerCase();

      // Match exact ou partiel (au moins 50% des mots)
      const motsDescription = descriptionLower.split(/\s+/).filter(m => m.length > 3);
      const motsCommuns = motsDescription.filter(mot => commentaireLower.includes(mot));
      const tauxMatch = motsCommuns.length / motsDescription.length;

      console.log(`[getProblemePhoto] Tâche "${tache.nom}" - taux match: ${(tauxMatch * 100).toFixed(0)}%`);

      return tauxMatch > 0.5; // Au moins 50% des mots en commun
    });

    if (tacheAvecProbleme?.photo_url) {
      console.log('[getProblemePhoto] ✅ Photo trouvée via commentaire de tâche:', tacheAvecProbleme.nom);
      return tacheAvecProbleme.photo_url;
    }

    // Stratégie 4 : Fallback - chercher par mots-clés dans le nom de la tâche
    const problemeText = `${probleme.titre} ${probleme.description}`.toLowerCase();
    const motsCourants = ['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'à', 'au', 'aux', 'pour', 'sur', 'dans', 'avec', 'sans', 'sont', 'pas', 'être', 'avoir', 'étape', 'photo', 'zone', 'non', 'conforme'];
    const motsProbleme = problemeText
      .replace(/[^\w\sàâäéèêëïîôùûüÿæœç]/g, ' ')
      .split(/\s+/)
      .filter(mot => mot.length > 3 && !motsCourants.includes(mot));

    const tachesAvecScore = piece.tachesValidees
      .filter(tache => tache.photo_url)
      .map(tache => {
        const tacheNom = tache.nom.toLowerCase().replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim();
        const motsCommuns = motsProbleme.filter(mot => tacheNom.includes(mot));
        return { tache, score: motsCommuns.length };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    if (tachesAvecScore.length > 0) {
      console.log('[getProblemePhoto] ✅ Photo trouvée via mots-clés:', tachesAvecScore[0].tache.nom);
      return tachesAvecScore[0].tache.photo_url!;
    }

    console.log('[getProblemePhoto] ❌ Aucune photo trouvée');
    return null;
  };

  // Trier les problèmes par sévérité (élevée > moyenne > faible)
  const problemesTries = useMemo(() => {
    const severiteOrder = { elevee: 0, moyenne: 1, faible: 2 };
    return [...piece.problemes].sort((a, b) => {
      return severiteOrder[a.severite] - severiteOrder[b.severite];
    });
  }, [piece.problemes]);

  const handlePhotoClick = (photo: string) => {
    onPhotoClick(photo);
  };
  const handleOpenSignalementDialog = (probleme: string, problemeId: string, index: number) => {
    setProblemeSelectionne(probleme);
    setProblemeIdSelectionne(problemeId);
    setProblemeIndex(index);
    setSignalementDialogOpen(true);
  };
  const handleOpenConsigneDialog = (probleme: string, problemeId: string, index: number) => {
    setProblemeSelectionne(probleme);
    setProblemeIdSelectionne(problemeId);
    setProblemeIndex(index);
    setConsigneDialogOpen(true);
  };
  const handleOpenFauxDialog = (probleme: string, problemeId: string, index: number) => {
    setProblemeSelectionne(probleme);
    setProblemeIdSelectionne(problemeId);
    setProblemeIndex(index);
    setFauxDialogOpen(true);
  };
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoSignalement(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleCreerSignalement = async () => {
    try {
      // Vérifier si l'ID du problème est un ID Bubble (format: 1234567890123x123456789012345678)
      // ou un ID généré par l'IA (format: p1, p2, etc.)
      const isBubbleId = problemeIdSelectionne && /^\d+x\d+$/.test(problemeIdSelectionne);

      // Appeler l'API pour créer le signalement
      await endpointRapportFormService.createSignalement(
        rapportId,
        userId,
        {
          pieceId: piece.id,
          etapeId: isBubbleId ? problemeIdSelectionne : null, // Envoyer l'ID seulement si c'est un ID Bubble
          probleme: problemeSelectionne,
          commentaire: commentaireSignalement,
          photoUrl: null,
          photoBase64: photoPreview
        }
      );

      // Ajouter le signalement à l'état local immédiatement (mise à jour optimiste)
      const nouveauSignalement = {
        signalement_id: `temp-${Date.now()}`, // ID temporaire
        description: commentaireSignalement,
        status: 'À traiter',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        img_url: photoPreview,
        typeText: 'Signalement IA',
        signaleur: {
          nom: '',
          prenom: userId,
          phone: ''
        },
        comment: '',
        room_id: piece.id
      };

      setLocalSignalements([...localSignalements, nouveauSignalement]);
      setProbleresAvecSignalement([...problemesAvecSignalement, problemeIndex]);

      toast({
        title: "Signalement créé",
        description: "Le signalement a été ajouté avec succès."
      });

      setSignalementDialogOpen(false);
      setCommentaireSignalement("");
      setPhotoSignalement(null);
      setPhotoPreview(null);

      // Rafraîchir les données en arrière-plan pour synchroniser avec le serveur
      if (onReload) {
        onReload();
      }
    } catch (error) {
      console.error("Erreur lors de la création du signalement:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le signalement.",
        variant: "destructive"
      });
    }
  };
  const handleAjouterConsigneIA = async () => {
    if (editingConsigneIndex !== null) {
      console.log("Modification consigne IA:", {
        index: editingConsigneIndex,
        type: typeConsigne,
        consigne: nouvelleConsigneIA
      });
      toast({
        title: "Consigne IA modifiée",
        description: "La consigne a été mise à jour avec succès."
      });
    } else {
      try {
        // Appeler l'API pour créer la consigne
        await endpointRapportFormService.createConsigneIA(
          rapportId,
          userId,
          {
            pieceId: piece.id,
            probleme: problemeSelectionne || null,
            consigne: nouvelleConsigneIA,
            type: typeConsigne
          }
        );

        // Ajouter la consigne à l'état local immédiatement (mise à jour optimiste)
        const nouvelleConsigne = {
          _id: `temp-${Date.now()}`, // ID temporaire
          Commentaire: nouvelleConsigneIA,
          "Created By": userId,
          "Created Date": Date.now(),
          "Modified Date": Date.now(),
          Piece: piece.id,
          os_consigneType: typeConsigne,
          ...(problemeSelectionne && { probleme: problemeSelectionne })
        };

        setLocalConsignesIA([...localConsignesIA, nouvelleConsigne]);

        toast({
          title: "Consigne ajoutée",
          description: "La consigne pour l'IA a été enregistrée."
        });

        // Rafraîchir les données en arrière-plan pour synchroniser avec le serveur
        if (onReload) {
          onReload();
        }
      } catch (error) {
        console.error("Erreur lors de la création de la consigne:", error);
        toast({
          title: "Erreur",
          description: "Impossible d'enregistrer la consigne.",
          variant: "destructive"
        });
      }
    }
    setConsigneDialogOpen(false);
    setNouvelleConsigneIA("");
    setTypeConsigne("ignorer");
    setEditingConsigneIndex(null);
  };
  const handleMarquerSignalementTraite = async (signalementId: string) => {
    try {
      // Appeler l'API pour marquer le signalement comme traité
      await endpointRapportFormService.markSignalementTraite(signalementId);

      // Mettre à jour l'état local pour changer le statut
      setLocalSignalements(localSignalements.map(s =>
        s.signalement_id === signalementId
          ? { ...s, status: 'Traité' }
          : s
      ));

      toast({
        title: "Signalement traité",
        description: "Le signalement a été marqué comme traité."
      });

      // Rafraîchir les données en arrière-plan pour synchroniser avec le serveur
      if (onReload) {
        onReload();
      }
    } catch (error) {
      console.error("Erreur lors du marquage du signalement comme traité:", error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer le signalement comme traité.",
        variant: "destructive"
      });
    }
  };

  const handleEditConsigne = (index: number, consigne: string | {
    type: 'ignorer' | 'surveiller';
    consigne: string;
  }) => {
    if (typeof consigne === 'string') {
      setNouvelleConsigneIA(consigne);
      setTypeConsigne("ignorer");
    } else {
      setNouvelleConsigneIA(consigne.consigne);
      setTypeConsigne(consigne.type);
    }
    setEditingConsigneIndex(index);
    setConsigneDialogOpen(true);
  };
  const handleDeleteConsigne = (index: number) => {
    console.log("Suppression consigne IA:", piece.consignesIA[index]);
    toast({
      title: "Consigne IA supprimée",
      description: "La consigne a été supprimée avec succès."
    });
  };
  const handleOpenNewConsigneDialog = () => {
    setEditingConsigneIndex(null);
    setNouvelleConsigneIA("");
    setTypeConsigne("ignorer");
    setProblemeSelectionne("");
    setProblemeIdSelectionne(null);
    setProblemeIndex(-1);
    setConsigneDialogOpen(true);
  };
  const handleMarquerCommeFaux = async () => {
    try {
      // Appeler l'API pour marquer comme faux positif
      await endpointRapportFormService.markFalsePositive(
        rapportId,
        userId,
        {
          pieceId: piece.id,
          probleme: problemeSelectionne
        }
      );

      toast({
        title: "Marqué comme faux",
        description: "Ce problème ne sera plus détecté par l'IA."
      });

      // Rafraîchir les données
      if (onReload) {
        onReload();
      }
    } catch (error) {
      console.error("Erreur lors du marquage comme faux positif:", error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer comme faux positif.",
        variant: "destructive"
      });
    }
    setFauxDialogOpen(false);
  };
  return <>
    <Card className="mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="p-3 md:p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">

              <div className="text-left flex-1 min-w-0">
                <h3 className="font-semibold text-base md:text-lg truncate">{piece.nom}</h3>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                  <div className="flex gap-0.5 md:gap-1">
                    {renderStars(piece.note)}
                  </div>

                  {piece.tachesValidees.filter(t => !t.estApprouve || tacheHasProblems(t)).length > 0 && <Badge variant="secondary" className="text-xs shrink-0">
                    {piece.tachesValidees.filter(t => !t.estApprouve || tacheHasProblems(t)).length} tâche{piece.tachesValidees.filter(t => !t.estApprouve || tacheHasProblems(t)).length > 1 ? 's' : ''} non réalisée{piece.tachesValidees.filter(t => !t.estApprouve || tacheHasProblems(t)).length > 1 ? 's' : ''}
                  </Badge>}

                  {piece.problemes.length > 0 && <Badge variant="default" className="text-xs bg-primary text-primary-foreground shrink-0">
                    {piece.problemes.length} fait{piece.problemes.length > 1 ? 's' : ''} signalé{piece.problemes.length > 1 ? 's' : ''} par l'IA
                  </Badge>}
                </div>
              </div>
            </div>
            {isOpen ? <ChevronUp className="h-4 md:h-5 w-4 md:w-5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 md:h-5 w-4 md:w-5 text-muted-foreground shrink-0" />}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-3.5 space-y-4">
            {/* Commentaire global */}
            {piece.resume && <div className="pb-4 border-b">
              <h4 className="text-sm font-medium mb-2">Commentaire global</h4>
              <p className="text-sm text-muted-foreground">{piece.resume}</p>
            </div>}

            {/* Tâches réalisées avec accordéon */}
            <div className="pb-4 border-b">
              <Accordion type="single" collapsible>
                <AccordionItem value="taches" className="border-none">
                  <AccordionTrigger className="py-2 hover:no-underline">
                    <span className="text-sm font-medium">
                      Tâches réalisées : {piece.tachesValidees.filter(t => t.estApprouve && !tacheHasProblems(t)).length}/{piece.tachesValidees.length}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pt-2">
                      {piece.tachesValidees.map((tache, index) => {
                        // Une tâche est considérée comme validée SI elle est approuvée ET qu'il n'y a pas de problème détecté par l'IA
                        const isValidated = tache.estApprouve && !tacheHasProblems(tache);

                        return <div key={index} className={`flex items-start gap-2 p-2 rounded-lg border ${isValidated ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'}`}>
                          {isValidated ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">{tache.nom}</p>
                            {tache.commentaire && <p className="text-xs text-muted-foreground mt-1">{tache.commentaire}</p>}

                            {/* Photos de la tâche si disponibles */}
                            {(tache.photo_reference_url || tache.photo_url) && (
                              <div className="mt-2 flex gap-2">
                                {/* Photo de référence */}
                                {tache.photo_reference_url && (
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground">Référence</span>
                                    <img
                                      src={tache.photo_reference_url}
                                      alt={`Photo de référence: ${tache.nom}`}
                                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-blue-300"
                                      onClick={() => onPhotoClick(tache.photo_reference_url!)}
                                    />
                                  </div>
                                )}

                                {/* Photo de vérification */}
                                {tache.photo_url && (
                                  <div className="flex flex-col gap-1">
                                    <span className="text-xs text-muted-foreground">Prise</span>
                                    <img
                                      src={tache.photo_url}
                                      alt={`Photo de vérification: ${tache.nom}`}
                                      className={`w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 ${
                                        tacheHasProblems(tache) ? 'border-red-500' : 'border-green-300'
                                      }`}
                                      onClick={() => onPhotoClick(tache.photo_url!)}
                                    />
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Message d'alerte si problème détecté par l'IA */}
                            {tacheHasProblems(tache) && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950/20 dark:border-red-900">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    {piece.problemes
                                      .filter(p => p.etapeId === tache.etapeId && p.detectionIA && !p.estFaux)
                                      .map((probleme, idx) => (
                                        <p key={idx} className="text-xs text-red-700 dark:text-red-400">
                                          {probleme.description}
                                        </p>
                                      ))
                                    }
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>;
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* État des lieux d'entrée */}
            {piece.checkEntree && <div className="border-b pb-3.5">
              <div className={`flex items-start gap-2 p-2 rounded-lg ${piece.checkEntree.estConforme ? 'bg-background' : 'bg-muted/30'}`}>
                {piece.checkEntree.estConforme ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium">État des lieux d'entrée</span>
                    {isValidDate(piece.checkEntree.dateHeureValidation) && (
                      <span className="text-xs text-muted-foreground">
                        {formatDateUtil(piece.checkEntree.dateHeureValidation)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5">
                    {piece.checkEntree.estConforme ? 'Conforme aux photos de référence' : 'Non conforme aux photos de référence'}
                  </p>
                </div>
              </div>
            </div>}

            {/* État des lieux de sortie */}
            {piece.checkSortie && <div className="border-b pb-3.5">
              <div className="flex items-start gap-2 p-2 rounded-lg">
                {piece.checkSortie.estValide ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium">État des lieux de sortie</span>
                    {isValidDate(piece.checkSortie.dateHeureValidation) && (
                      <>
                        <span className="text-xs text-muted-foreground">-</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateUtil(piece.checkSortie.dateHeureValidation)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs mt-0.5">
                    {piece.checkSortie.estValide ? 'Validé' : 'Non validé'}
                  </p>
                </div>
              </div>
            </div>}

            {/* Faits signalés par l'IA */}
            {piece.problemes.length > 0}

            {/* Consignes pour l'IA */}
            {piece.consignesIA.length > 0}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Section Photos - Toujours visible */}
      {(piece.photosReference.length > 0 ||
        (piece.checkEntree?.photosEntree && piece.checkEntree.photosEntree.length > 0) ||
        (piece.checkSortie?.photosSortie && piece.checkSortie.photosSortie.length > 0)) && (
        <CardContent className="border-t pt-3.5">
          <Card className="bg-card">
            <CardContent className="p-3 md:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Photos de référence */}
                {piece.photosReference.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      <h5 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">Référence</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {piece.photosReference.map((photo, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={photo}
                            alt={`Photo de référence ${idx + 1}`}
                            className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-300"
                            onClick={() => onPhotoClick(photo)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos d'entrée */}
                {piece.checkEntree?.photosEntree && piece.checkEntree.photosEntree.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <h5 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">Entrée</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {piece.checkEntree.photosEntree.map((photo, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={photo}
                            alt={`Photo d'entrée ${idx + 1}`}
                            className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 border-green-500"
                            onClick={() => onPhotoClick(photo)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos de sortie */}
                {piece.checkSortie?.photosSortie && piece.checkSortie.photosSortie.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <h5 className="text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wide">Sortie</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {piece.checkSortie.photosSortie.map((photo, idx) => {
                        // Gérer les deux formats : string ou objet PhotoSortie
                        const photoUrl = typeof photo === 'string' ? photo : photo.url;
                        const isNonConforme = piece.checkSortie?.photosNonConformes?.includes(photoUrl);

                        return (
                          <div key={idx} className="relative">
                            <img
                              src={photoUrl}
                              alt={`Photo de sortie ${idx + 1}`}
                              className={`w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border-2 ${
                                isNonConforme ? 'border-red-500' : 'border-yellow-500'
                              }`}
                              onClick={() => onPhotoClick(photoUrl)}
                            />
                            {isNonConforme && (
                              <div className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1">
                                <AlertTriangle className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      )}

      {/* Faits signalés par l'IA - Section toujours visible */}
      {piece.problemes.length > 0 && <CardContent className="border-t pt-3.5">
        <Card className="bg-card">
          <CardContent className="p-3 md:p-4">
            <h4 className="font-medium mb-2 md:mb-3 text-xs md:text-sm flex items-center gap-2">
              <Bot className="h-3.5 md:h-4 w-3.5 md:w-4 text-primary" />
              Faits signalés par l&apos;IA
            </h4>
            <div className="space-y-2">
              {problemesTries.map((probleme, idx) => {
                // Trouver l'index original du problème pour les états (signalement, consigne, faux)
                const originalIndex = piece.problemes.findIndex(p => p.id === probleme.id);
                const estSignale = problemesAvecSignalement.includes(originalIndex);
                const estConsigneAjoutee = problemesAvecConsigne.includes(originalIndex);
                const estFaux = problemesMarquesFaux.includes(originalIndex);
                const bgColor = estFaux ? "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800 opacity-50" : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900";
                // Extraire le type de fait (avant les ":")
                const typeFait = probleme.titre.split(':')[0].trim();

                // Récupérer la photo associée au problème
                const photoProbleme = getProblemePhoto(probleme);

                return <div key={probleme.id || idx} className={`p-2 rounded-lg border ${bgColor}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {/* Type de fait signalé */}
                      <div className="flex items-start gap-2 mb-1 flex-wrap">
                        <p className="text-xs font-semibold text-muted-foreground flex-1">
                          {typeFait}
                        </p>
                        {/* Badge de sévérité */}
                        <Badge variant="outline" className={`text-xs ${getSeveriteBadgeStyle(probleme.severite)} shrink-0`}>
                          {getSeveriteIcon(probleme.severite)}
                          <span className="ml-1">{getSeveriteLabel(probleme.severite)}</span>
                        </Badge>
                        {estSignale && <Badge variant="default" className="text-xs bg-info text-info-foreground">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Signalement créé
                        </Badge>}
                        {estConsigneAjoutee && <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                          <Lightbulb className="w-3 h-3 mr-1" />
                          Consigne IA ajoutée
                        </Badge>}
                        {estFaux && <Badge variant="destructive" className="text-xs">
                          <X className="w-3 h-3 mr-1" />
                          Marqué comme faux
                        </Badge>}
                      </div>
                      {/* Description complète du problème */}
                      <p className="font-medium text-sm whitespace-pre-wrap break-words">
                        {probleme.description || probleme.titre}
                      </p>
                    </div>

                    {/* Photo discrète du problème (si disponible) */}
                    {photoProbleme && (
                      <div className="flex-shrink-0 ml-2">
                        <img
                          src={photoProbleme}
                          alt="Photo du problème"
                          className="w-16 h-16 md:w-12 md:h-12 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-border"
                          onClick={() => onPhotoClick(photoProbleme)}
                        />
                      </div>
                    )}

                    {!estFaux && <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => {
                          setProblemeSelectionne(probleme.description);
                          setProblemeIdSelectionne(probleme.id);
                          setProblemeIndex(originalIndex);
                          setSignalementDialogOpen(true);
                        }}>
                          <AlertCircle className="mr-2 h-4 w-4 text-info" />
                          Créer un signalement
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setProblemeSelectionne(probleme.description);
                          setProblemeIdSelectionne(probleme.id);
                          setProblemeIndex(originalIndex);
                          setConsigneDialogOpen(true);
                        }}>
                          <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                          Ajouter aux consignes IA
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setProblemeSelectionne(probleme.description);
                          setProblemeIdSelectionne(probleme.id);
                          setProblemeIndex(originalIndex);
                          setFauxDialogOpen(true);
                        }} className="text-destructive focus:text-destructive">
                          <X className="mr-2 h-4 w-4" />
                          Marquer comme faux
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>}
                  </div>
                </div>;
              })}
            </div>
          </CardContent>
        </Card>
      </CardContent>}

      {/* Signalements utilisateurs - Section séparée */}
      {localSignalements && localSignalements.length > 0 && (
        <CardContent className="pt-3.5">
          <Card className="bg-card">
            <CardContent className="p-4">
              <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Signalements utilisateurs
              </h5>
              <div className="space-y-3">
                {localSignalements.map((signalement: any, index: number) => (
                  <div
                    key={signalement.signalement_id || index}
                    className="p-4 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {/* Type et statut */}
                        <div className="flex items-center gap-2 mb-2">
                          {signalement.typeText && (
                            <Badge variant="outline" className="text-xs">
                              {signalement.typeText}
                            </Badge>
                          )}
                          {signalement.status && (
                            <Badge
                              variant={signalement.status === 'À traiter' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {signalement.status}
                            </Badge>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm font-medium text-foreground mb-2 whitespace-pre-wrap break-words">
                          {signalement.description || signalement.commentaire}
                        </p>

                        {/* Commentaire de traitement */}
                        {signalement.comment && signalement.comment.trim() !== '' && (
                          <div className="mb-2 p-2 bg-muted/50 rounded border border-border">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Commentaire de traitement :</p>
                            <p className="text-xs text-foreground whitespace-pre-wrap break-words">{signalement.comment}</p>
                          </div>
                        )}

                        {/* Informations du signaleur */}
                        {signalement.signaleur && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            <span>Signalé par: {signalement.signaleur.prenom} {signalement.signaleur.nom}</span>
                            {signalement.signaleur.phone && (
                              <>
                                <span>•</span>
                                <span>{signalement.signaleur.phone}</span>
                              </>
                            )}
                            {isValidDate(signalement.created_at) && (
                              <>
                                <span>•</span>
                                <span>{new Date(signalement.created_at).toLocaleDateString('fr-FR')}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Photo du signalement */}
                      <div className="flex items-start gap-2">
                        {signalement.img_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={signalement.img_url}
                              alt="Photo du signalement"
                              className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => onPhotoClick(signalement.img_url)}
                            />
                          </div>
                        )}

                        {/* Menu dropdown pour actions */}
                        {signalement.status === 'À traiter' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleMarquerSignalementTraite(signalement.signalement_id)}>
                                <CheckCircle className="h-4 w-4 mr-2 text-success" />
                                Marquer comme traité
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      )}

      {/* Consignes pour l'IA - Section toujours visible */}
      <CardContent className="pt-3.5">
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className={`flex items-center justify-between ${(!piece.consignesIA || piece.consignesIA.length === 0) && (!localConsignesIA || localConsignesIA.length === 0) ? 'mb-0' : 'mb-4'}`}>
              <h4 className="font-medium text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Consignes pour l'IA
              </h4>
              <Button size="sm" variant="outline" onClick={() => {
                setProblemeSelectionne("");
                setProblemeIdSelectionne(null);
                setConsigneDialogOpen(true);
              }} className="h-7 text-xs">
                <Lightbulb className="w-3 h-3 mr-1" />
                Ajouter
              </Button>
            </div>

            <div className="space-y-4">
              {/* Consignes à ignorer */}
              {piece.consignesIA && piece.consignesIA.filter(c => typeof c === 'string' || c.type === 'ignorer').length > 0 && <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-warning" />
                  <h5 className="text-sm font-medium text-foreground">À ignorer</h5>
                </div>
                <ul className="space-y-1.5 ml-4">
                  {piece.consignesIA.filter(c => typeof c === 'string' || c.type === 'ignorer').map((consigne, idx) => {
                    const originalIndex = piece.consignesIA.findIndex(c => (typeof c === 'string' ? c : c.consigne) === (typeof consigne === 'string' ? consigne : consigne.consigne));
                    return <li key={idx} className="group text-xs text-muted-foreground flex items-start gap-2 hover:bg-accent/50 rounded px-2 py-1 -mx-2 transition-colors">
                      <span className="text-warning mt-0.5">•</span>
                      <span className="flex-1 whitespace-pre-wrap break-words">{typeof consigne === 'string' ? consigne : consigne.consigne}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={e => {
                            e.stopPropagation();
                            handleEditConsigne(originalIndex, consigne);
                          }}>
                            <Pencil className="h-3 w-3 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={e => {
                            e.stopPropagation();
                            handleDeleteConsigne(originalIndex);
                          }} className="text-destructive">
                            <Trash2 className="h-3 w-3 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>;
                  })}
                </ul>
              </div>}

              {/* Consignes à surveiller */}
              {piece.consignesIA && piece.consignesIA.filter(c => typeof c !== 'string' && c.type === 'surveiller').length > 0 && <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-info" />
                  <h5 className="text-sm font-medium text-foreground">À surveiller en priorité</h5>
                </div>
                <ul className="space-y-1.5 ml-4">
                  {piece.consignesIA.filter(c => typeof c !== 'string' && c.type === 'surveiller').map((consigne, idx) => {
                    const originalIndex = piece.consignesIA.findIndex(c => typeof c !== 'string' && c.consigne === (typeof consigne !== 'string' ? consigne.consigne : ''));
                    return <li key={idx} className="group text-xs text-muted-foreground flex items-start gap-2 hover:bg-accent/50 rounded px-2 py-1 -mx-2 transition-colors">
                      <span className="text-info mt-0.5">•</span>
                      <span className="flex-1 whitespace-pre-wrap break-words">{typeof consigne !== 'string' ? consigne.consigne : ''}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={e => {
                            e.stopPropagation();
                            handleEditConsigne(originalIndex, consigne);
                          }}>
                            <Pencil className="h-3 w-3 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={e => {
                            e.stopPropagation();
                            handleDeleteConsigne(originalIndex);
                          }} className="text-destructive">
                            <Trash2 className="h-3 w-3 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>;
                  })}
                </ul>
              </div>}

              {/* Consignes IA depuis Bubble */}
              {localConsignesIA && localConsignesIA.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Consignes enregistrées
                  </h5>
                  <div className="space-y-2">
                    {localConsignesIA.map((consigne) => {
                      const isIgnorer = consigne.os_consigneType === 'ignorer';
                      const isSurveiller = consigne.os_consigneType === 'surveiller';

                      return (
                        <div
                          key={consigne._id}
                          className={`p-3 rounded-lg border ${isIgnorer
                            ? 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800'
                            : isSurveiller
                              ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-900'
                              : 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900'
                            }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              {consigne.os_consigneType && (
                                <div className="flex items-center gap-2 mb-2">
                                  {isIgnorer && (
                                    <Badge variant="secondary" className="text-xs">
                                      🔕 À ignorer
                                    </Badge>
                                  )}
                                  {isSurveiller && (
                                    <Badge variant="default" className="text-xs bg-orange-500">
                                      ⚠️ À surveiller
                                    </Badge>
                                  )}
                                </div>
                              )}
                              {consigne.probleme && (
                                <div className="mb-2 p-2 bg-muted/50 rounded border border-border">
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Problème détecté :</p>
                                  <p className="text-xs text-foreground whitespace-pre-wrap break-words">{consigne.probleme}</p>
                                </div>
                              )}
                              <p className="text-sm text-foreground whitespace-pre-wrap break-words">{consigne.Commentaire}</p>
                              {isValidDate(consigne["Created Date"]) && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  Ajouté le {formatConsigneDate(consigne["Created Date"])}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!piece.consignesIA || piece.consignesIA.length === 0) && (!localConsignesIA || localConsignesIA.length === 0) && <p className="text-xs text-muted-foreground text-center py-1.5">
                Aucune consigne pour l'IA. Cliquez sur "Ajouter" pour en créer une.
              </p>}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>

    {/* Dialog Créer un signalement */}
    <Dialog open={signalementDialogOpen} onOpenChange={setSignalementDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-info" />
            Créer un signalement
          </DialogTitle>
          <DialogDescription className="text-sm">
            Documentez ce problème pour le transmettre au propriétaire ou à l'équipe
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Problème signalé */}
          <div className="rounded-lg bg-info/10 border border-info/20 p-3">
            <Label className="text-xs font-medium text-info-foreground mb-1">Problème signalé</Label>
            <p className="text-sm text-foreground mt-1">{problemeSelectionne}</p>
          </div>

          {/* Commentaire */}
          <div className="space-y-2">
            <Label htmlFor="commentaire" className="text-sm font-medium">Commentaire</Label>
            <Textarea id="commentaire" value={commentaireSignalement} onChange={e => setCommentaireSignalement(e.target.value)} placeholder="Décrivez le problème, son emplacement exact, et toute information pertinente..." className="min-h-[120px] resize-none" />
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <Label htmlFor="photo" className="text-sm font-medium">Photo (optionnelle)</Label>
            <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer cursor-pointer" />
            {photoPreview && <div className="relative mt-3">
              <img src={photoPreview} alt="Preview" className="w-full max-h-48 sm:max-h-64 object-cover rounded-lg border" />
            </div>}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setSignalementDialogOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleCreerSignalement} className="bg-info text-info-foreground hover:bg-info/90">
            <AlertCircle className="w-4 h-4 mr-2" />
            Créer le signalement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Dialog Ajouter une consigne IA */}
    <Dialog open={consigneDialogOpen} onOpenChange={open => {
      setConsigneDialogOpen(open);
      if (!open) {
        setEditingConsigneIndex(null);
        setNouvelleConsigneIA("");
        setTypeConsigne("ignorer");
      }
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lightbulb className="h-5 w-5 text-primary" />
            {editingConsigneIndex !== null ? 'Modifier la consigne IA' : 'Ajouter aux consignes IA'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {editingConsigneIndex !== null ? 'Modifiez la consigne pour que l\'IA sache comment traiter ce type de problème.' : 'Indiquez à l\'IA comment traiter ce type de problème'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Problème détecté - uniquement si on vient d'un problème */}
          {problemeSelectionne && <div className="rounded-lg bg-warning/10 border border-warning/20 p-3">
            <Label className="text-xs font-medium text-warning-foreground mb-1">Problème détecté</Label>
            <p className="text-sm text-foreground mt-1">{problemeSelectionne}</p>
          </div>}

          {/* Type de consigne */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Type de consigne</Label>
            <RadioGroup value={typeConsigne} onValueChange={(value: "ignorer" | "surveiller") => setTypeConsigne(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent/50" onClick={() => setTypeConsigne("ignorer")}>
                <RadioGroupItem value="ignorer" id="ignorer" />
                <Label htmlFor="ignorer" className="font-normal cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                      À ignorer
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      L'IA ignorera ce type de problème
                    </span>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-accent/50" onClick={() => setTypeConsigne("surveiller")}>
                <RadioGroupItem value="surveiller" id="surveiller" />
                <Label htmlFor="surveiller" className="font-normal cursor-pointer flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-info/10 text-info border-info">
                      À surveiller
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      L'IA accordera plus d'attention
                    </span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Consigne personnalisée */}
          <div className="space-y-2">
            <Label htmlFor="consigne" className="text-sm font-medium">Consigne pour l'IA</Label>
            <Textarea id="consigne" value={nouvelleConsigneIA} onChange={e => setNouvelleConsigneIA(e.target.value)} placeholder={typeConsigne === "ignorer" ? "Ex: Ignorer les cartons alimentaires posés sur la table car c'est acceptable pour ce type de location" : "Ex: Surveiller particulièrement ce type de problème car il est fréquent dans cette pièce"} className="min-h-[100px] resize-none" />
            <p className="text-xs text-muted-foreground">
              {typeConsigne === "ignorer" ? "Cette consigne dira à l'IA de ne plus signaler ce type de problème." : "Cette consigne augmentera la priorité de détection de ce type de problème."}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => {
            setConsigneDialogOpen(false);
            setEditingConsigneIndex(null);
            setNouvelleConsigneIA("");
          }}>
            Annuler
          </Button>
          <Button onClick={handleAjouterConsigneIA} disabled={!nouvelleConsigneIA.trim()}>
            <Lightbulb className="w-4 h-4 mr-2" />
            {editingConsigneIndex !== null ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Dialog Marquer comme faux */}
    <Dialog open={fauxDialogOpen} onOpenChange={setFauxDialogOpen}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <X className="h-5 w-5 text-destructive" />
            Marquer comme faux positif
          </DialogTitle>
          <DialogDescription className="text-sm">
            Cette action aide l'IA à ne plus détecter ce type de faux positif
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm">
              Êtes-vous sûr que <span className="font-medium text-foreground">"{problemeSelectionne}"</span> est un faux positif ?
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              L'IA ne détectera plus ce type de problème dans cette pièce.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setFauxDialogOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleMarquerCommeFaux}>
            <X className="w-4 h-4 mr-2" />
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}