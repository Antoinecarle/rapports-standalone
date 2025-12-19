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
import { useState } from "react";
import { ChevronDown, ChevronUp, Star, CheckCircle, XCircle, AlertTriangle, MessageSquare, Lightbulb, Image as ImageIcon, AlertCircle, X, MoreVertical, Pencil, Trash2, Bot } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
interface TacheValidation {
  nom: string;
  estApprouve: boolean;
  dateHeureValidation: string;
  commentaire?: string;
  photo_url?: string;
  photo_reference_url?: string;
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
    photosReprises?: string[];
  };
  checkSortie?: {
    estValide: boolean;
    dateHeureValidation: string;
    photosSortie: string[];
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
  }[];
  consignesIA: (string | {
    type: 'ignorer' | 'surveiller';
    consigne: string;
  })[];
}
interface RapportPieceDetailProps {
  piece: PieceData;
  onPhotoClick: (photo: string) => void;
}
const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }) + ' à ' + date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
const renderStars = (count: number) => {
  return <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < count ? 'fill-primary text-primary' : 'text-gray-300'}`} />)}
    </div>;
};
export default function RapportPieceDetail({
  piece,
  onPhotoClick
}: RapportPieceDetailProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [signalementDialogOpen, setSignalementDialogOpen] = useState(false);
  const [consigneDialogOpen, setConsigneDialogOpen] = useState(false);
  const [fauxDialogOpen, setFauxDialogOpen] = useState(false);
  const [problemeSelectionne, setProblemeSelectionne] = useState("");
  const [problemeIndex, setProblemeIndex] = useState(-1);
  const [commentaireSignalement, setCommentaireSignalement] = useState("");
  const [photoSignalement, setPhotoSignalement] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [nouvelleConsigneIA, setNouvelleConsigneIA] = useState("");
  const [problemesMarquesFaux, setProbleresMarquesFaux] = useState<number[]>([]);
  const [problemesAvecSignalement, setProbleresAvecSignalement] = useState<number[]>([]);
  const [problemesAvecConsigne, setProbleresAvecConsigne] = useState<number[]>([]);
  const [typeConsigne, setTypeConsigne] = useState<"ignorer" | "surveiller">("ignorer");
  const [editingConsigneIndex, setEditingConsigneIndex] = useState<number | null>(null);
  const {
    toast
  } = useToast();
  const handlePhotoClick = (photo: string) => {
    onPhotoClick(photo);
  };
  const handleOpenSignalementDialog = (probleme: string, index: number) => {
    setProblemeSelectionne(probleme);
    setProblemeIndex(index);
    setSignalementDialogOpen(true);
  };
  const handleOpenConsigneDialog = (probleme: string, index: number) => {
    setProblemeSelectionne(probleme);
    setProblemeIndex(index);
    setConsigneDialogOpen(true);
  };
  const handleOpenFauxDialog = (probleme: string, index: number) => {
    setProblemeSelectionne(probleme);
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
  const handleCreerSignalement = () => {
    const signalement = {
      piece: piece.nom,
      probleme: problemeSelectionne,
      commentaire: commentaireSignalement,
      photo: photoPreview,
      date: new Date().toISOString()
    };
    const signalementsExistants = JSON.parse(localStorage.getItem('signalements') || '[]');
    signalementsExistants.push(signalement);
    localStorage.setItem('signalements', JSON.stringify(signalementsExistants));
    setProbleresAvecSignalement([...problemesAvecSignalement, problemeIndex]);
    toast({
      title: "Signalement créé",
      description: "Le signalement a été ajouté avec succès."
    });
    setSignalementDialogOpen(false);
    setCommentaireSignalement("");
    setPhotoSignalement(null);
    setPhotoPreview(null);
  };
  const handleAjouterConsigneIA = () => {
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
      const consigne = {
        piece: piece.nom,
        probleme: problemeSelectionne,
        consigne: nouvelleConsigneIA,
        type: typeConsigne,
        date: new Date().toISOString()
      };
      const consignesExistantes = JSON.parse(localStorage.getItem('consignesIA') || '[]');
      consignesExistantes.push(consigne);
      localStorage.setItem('consignesIA', JSON.stringify(consignesExistantes));
      setProbleresAvecConsigne([...problemesAvecConsigne, problemeIndex]);
      toast({
        title: "Consigne ajoutée",
        description: "La consigne pour l'IA a été enregistrée."
      });
    }
    setConsigneDialogOpen(false);
    setNouvelleConsigneIA("");
    setTypeConsigne("ignorer");
    setEditingConsigneIndex(null);
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
    setProblemeIndex(-1);
    setConsigneDialogOpen(true);
  };
  const handleMarquerCommeFaux = () => {
    const fauxPositif = {
      piece: piece.nom,
      probleme: problemeSelectionne,
      date: new Date().toISOString()
    };
    const fauxPositifsExistants = JSON.parse(localStorage.getItem('fauxPositifs') || '[]');
    fauxPositifsExistants.push(fauxPositif);
    localStorage.setItem('fauxPositifs', JSON.stringify(fauxPositifsExistants));
    setProbleresMarquesFaux([...problemesMarquesFaux, problemeIndex]);
    toast({
      title: "Marqué comme faux",
      description: "Ce problème ne sera plus détecté par l'IA."
    });
    setFauxDialogOpen(false);
  };
  return <>
      <Card className="mb-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="w-full">
            <div className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                
                <div className="text-left">
                  <h3 className="font-semibold text-lg">{piece.nom}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex gap-1">
                      {renderStars(piece.note)}
                    </div>
                    
                    {piece.tachesValidees.filter(t => !t.estApprouve).length > 0 && <Badge variant="secondary" className="text-xs">
                        {piece.tachesValidees.filter(t => !t.estApprouve).length} tâche{piece.tachesValidees.filter(t => !t.estApprouve).length > 1 ? 's' : ''} non réalisée{piece.tachesValidees.filter(t => !t.estApprouve).length > 1 ? 's' : ''}
                      </Badge>}
                    
                    {piece.problemes.length > 0 && <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
                        {piece.problemes.length} fait{piece.problemes.length > 1 ? 's' : ''} signalé{piece.problemes.length > 1 ? 's' : ''} par l'IA
                      </Badge>}
                  </div>
                </div>
              </div>
              {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-3.5 space-y-4">
              {/* Photos de référence avec accordéon */}
              {piece.photosReference.length > 0 && <Accordion type="single" collapsible className="border-none">
                  <AccordionItem value="photos-ref" className="border-none">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Voir les {piece.photosReference.length} photo{piece.photosReference.length > 1 ? 's' : ''} de référence
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {piece.photosReference.map((photo, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <img 
                              src={photo} 
                              alt={`Photo de référence ${idx + 1}`} 
                              className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity" 
                              onClick={() => handlePhotoClick(photo)} 
                            />
                            <p className="text-[10px] text-muted-foreground text-center">
                              {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>}

              {/* Photos d'entrée (check-in) */}
              {piece.checkEntree?.photosEntree && piece.checkEntree.photosEntree.length > 0 && (
                <Accordion type="single" collapsible className="border-none">
                  <AccordionItem value="photos-entree" className="border-none">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Voir les {piece.checkEntree.photosEntree.length} photo{piece.checkEntree.photosEntree.length > 1 ? 's' : ''} d'entrée
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {piece.checkEntree.photosEntree.map((photo, idx) => (
                          <div key={idx} className="flex flex-col gap-1">
                            <img
                              src={photo}
                              alt={`Photo d'entrée ${idx + 1}`}
                              className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => handlePhotoClick(photo)}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* État des lieux d'entrée */}
              {piece.checkEntree && <div className="border-b pb-3.5">
                  <div className={`flex items-start gap-2 p-2 rounded-lg ${piece.checkEntree.estConforme ? 'bg-background' : 'bg-muted/30'}`}>
                    {piece.checkEntree.estConforme ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium">État des lieux d'entrée</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(piece.checkEntree.dateHeureValidation)}
                        </span>
                      </div>
                      <p className="text-xs mt-0.5">
                        {piece.checkEntree.estConforme ? 'Conforme aux photos de référence' : 'Non conforme aux photos de référence'}
                      </p>

                      {/* Accordéon photos reprises si non conforme */}
                      {!piece.checkEntree.estConforme && piece.checkEntree.photosReprises && piece.checkEntree.photosReprises.length > 0 && (
                        <Accordion type="single" collapsible className="mt-2">
                          <AccordionItem value="photos-reprises" className="border-none">
                            <AccordionTrigger className="py-2 hover:no-underline">
                              <span className="text-xs text-muted-foreground">
                                Voir les {piece.checkEntree.photosReprises.length} photo{piece.checkEntree.photosReprises.length > 1 ? 's' : ''} reprise{piece.checkEntree.photosReprises.length > 1 ? 's' : ''}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="grid grid-cols-4 gap-2 pt-2">
                                {piece.checkEntree.photosReprises.map((photo, idx) => (
                                  <div key={idx} className="flex flex-col gap-1">
                                    <img 
                                      src={photo} 
                                      alt={`Photo reprise ${idx + 1}`} 
                                      className="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity" 
                                      onClick={() => handlePhotoClick(photo)} 
                                    />
                                    <p className="text-[10px] text-muted-foreground text-center">
                                      {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  </div>
                </div>}

              {/* État des lieux de sortie */}
              {piece.checkSortie && <div className="border-b pb-3.5">
                  {piece.checkSortie.photosSortie && piece.checkSortie.photosSortie.length > 0 ? <Accordion type="single" collapsible>
                      <AccordionItem value="photos-sortie" className="border-none">
                        <AccordionTrigger className="py-2 px-2 hover:no-underline rounded-lg bg-muted/30 hover:bg-accent/50">
                          <div className="flex flex-col gap-1 text-left flex-1">
                            <div className="flex items-center gap-2">
                              {piece.checkSortie.estValide ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />}
                              <span className="text-xs font-medium">État des lieux de sortie</span>
                              <span className="text-xs text-muted-foreground">-</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(piece.checkSortie.dateHeureValidation)}
                              </span>
                              <span className="text-xs text-muted-foreground">-</span>
                              <span className="text-xs text-muted-foreground">
                                {piece.checkSortie.photosSortie.length} photo{piece.checkSortie.photosSortie.length > 1 ? 's' : ''} de sortie
                              </span>
                            </div>
                            <span className="text-xs ml-6">
                              {piece.checkSortie.estValide ? 'Validé' : `Non validé (${piece.checkSortie.photosNonConformes?.length || 0} photo${(piece.checkSortie.photosNonConformes?.length || 0) > 1 ? 's' : ''} non conforme${(piece.checkSortie.photosNonConformes?.length || 0) > 1 ? 's' : ''} selon l'IA)`}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="px-2 pt-2">
                            <div className="grid grid-cols-4 gap-2">
                              {piece.checkSortie.photosSortie.map((photo, idx) => {
                          const isNonConforme = piece.checkSortie?.photosNonConformes?.includes(photo);
                          return (
                            <div key={idx} className="flex flex-col gap-1">
                              <div className="relative">
                                <img 
                                  src={photo} 
                                  alt={`Photo de sortie ${idx + 1}`} 
                                  className={`w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${isNonConforme ? 'ring-2 ring-orange-500' : ''}`} 
                                  onClick={() => handlePhotoClick(photo)} 
                                />
                                {isNonConforme && (
                                  <div className="absolute top-1 right-1 bg-orange-500 text-white rounded-full p-1">
                                    <AlertTriangle className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground text-center">
                                {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          );
                        })}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion> : <div className="flex items-center gap-2 p-2 rounded-lg">
                      {piece.checkSortie.estValide ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /> : <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />}
                      <span className="text-xs font-medium">État des lieux de sortie</span>
                      <span className="text-xs text-muted-foreground">-</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(piece.checkSortie.dateHeureValidation)}
                      </span>
                      <span className="text-xs text-muted-foreground">-</span>
                      <p className="text-xs">
                        {piece.checkSortie.estValide ? 'Validé' : 'Non validé'}
                      </p>
                    </div>}
                </div>}

              {/* Tâches réalisées avec accordéon */}
              <div className="pb-4 border-b">
                <Accordion type="single" collapsible>
                  <AccordionItem value="taches" className="border-none">
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <span className="text-sm font-medium">
                        Tâches réalisées : {piece.tachesValidees.filter(t => t.estApprouve).length}/{piece.tachesValidees.length}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pt-2">
                        {piece.tachesValidees.map((tache, index) => <div key={index} className={`flex items-start gap-2 p-2 rounded-lg border ${tache.estApprouve ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900'}`}>
                            {tache.estApprouve ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /> : <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-xs">{tache.nom}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(tache.dateHeureValidation)}
                                </span>
                              </div>
                              {tache.commentaire && <p className="text-xs text-muted-foreground mt-1">{tache.commentaire}</p>}

                              {/* Photo de la tâche si disponible */}
                              {tache.photo_url && (
                                <div className="mt-2">
                                  <img
                                    src={tache.photo_url}
                                    alt={`Photo de la tâche: ${tache.nom}`}
                                    className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => handlePhotoClick(tache.photo_url!)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>)}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Commentaire global */}
              {piece.resume && <div className="pb-4">
                  <h4 className="text-sm font-medium mb-2">Commentaire global</h4>
                  <p className="text-sm text-muted-foreground">{piece.resume}</p>
                </div>}

              {/* Faits signalés par l'IA */}
              {piece.problemes.length > 0}

              {/* Consignes pour l'IA */}
              {piece.consignesIA.length > 0}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>

        {/* Faits signalés par l'IA - Section toujours visible */}
        {piece.problemes.length > 0 && <CardContent className="border-t pt-3.5">
            <Card className="bg-card">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  Faits signalés par l&apos;IA
                </h4>
                <div className="space-y-2">
                  {piece.problemes.map((probleme, idx) => {
                const estSignale = problemesAvecSignalement.includes(idx);
                const estConsigneAjoutee = problemesAvecConsigne.includes(idx);
                const estFaux = problemesMarquesFaux.includes(idx);
                const bgColor = estFaux ? "bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800 opacity-50" : "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900";
                return <div key={idx} className={`p-2 rounded-lg border ${bgColor}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <p className="font-medium text-sm">{probleme.titre}</p>
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
                            
                          </div>
                          {!estFaux && <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={() => {
                          setProblemeSelectionne(probleme.description);
                          setProblemeIndex(idx);
                          setSignalementDialogOpen(true);
                        }}>
                                  <AlertCircle className="mr-2 h-4 w-4 text-info" />
                                  Créer un signalement
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                          setProblemeSelectionne(probleme.description);
                          setProblemeIndex(idx);
                          setConsigneDialogOpen(true);
                        }}>
                                  <Lightbulb className="mr-2 h-4 w-4 text-primary" />
                                  Ajouter aux consignes IA
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                          setProblemeSelectionne(probleme.description);
                          setProblemeIndex(idx);
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

        {/* Consignes pour l'IA - Section toujours visible */}
        <CardContent className="pt-3.5">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Consignes pour l'IA
                </h4>
                <Button size="sm" variant="outline" onClick={() => {
                setProblemeSelectionne("");
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
                          <span className="flex-1">{typeof consigne === 'string' ? consigne : consigne.consigne}</span>
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
                          <span className="flex-1">{typeof consigne !== 'string' ? consigne.consigne : ''}</span>
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
            
            {(!piece.consignesIA || piece.consignesIA.length === 0) && <p className="text-xs text-muted-foreground text-center py-4">
                Aucune consigne pour l'IA. Cliquez sur "Modifier" pour en créer une.
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
                  <img src={photoPreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg border" />
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