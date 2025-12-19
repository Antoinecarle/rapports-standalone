import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreVertical, Download, Trash2, Check, Plus, Phone, ExternalLink, ZoomIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ModifierPhotosDialogProps, PhotoReference, PiecePhotos } from "@/types/rapport";
import { formatDateLong, isValidDate } from "@/utils/dateUtils";

export const ModifierPhotosDialog = ({
  open,
  onOpenChange,
  rapportId,
  nomOperateur,
  dateDebut,
  dateFin,
  telephone,
  pieces: initialPieces,
  onSave,
}: ModifierPhotosDialogProps) => {
  const [pieces, setPieces] = useState<PiecePhotos[]>(initialPieces);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoReference | null>(null);
  const [expandedPieces, setExpandedPieces] = useState<string[]>(
    initialPieces.map((p) => p.pieceId)
  );
  const { toast } = useToast();

  const togglePiece = (pieceId: string) => {
    setExpandedPieces((prev) =>
      prev.includes(pieceId)
        ? prev.filter((id) => id !== pieceId)
        : [...prev, pieceId]
    );
  };

  const handlePhotoSelect = (pieceId: string, photoId: string) => {
    setPieces((prev) =>
      prev.map((piece) =>
        piece.pieceId === pieceId
          ? { ...piece, photoReferenceActive: photoId }
          : piece
      )
    );
    toast({
      title: "Photo de référence mise à jour",
      description: "La photo a été définie comme nouvelle référence",
    });
  };

  const handlePhotoDelete = (pieceId: string, photoId: string) => {
    setPieces((prev) =>
      prev.map((piece) =>
        piece.pieceId === pieceId
          ? {
            ...piece,
            photos: piece.photos.filter((p) => p.id !== photoId),
          }
          : piece
      )
    );
    toast({
      title: "Photo supprimée",
      description: "La photo a été supprimée avec succès",
    });
  };

  const handlePhotoDownload = (photo: PhotoReference) => {
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = `photo-${photo.date}.jpg`;
    link.click();
    toast({
      title: "Téléchargement démarré",
      description: "La photo est en cours de téléchargement",
    });
  };

  const handleSave = () => {
    onSave(pieces);
    onOpenChange(false);
    toast({
      title: "Photos de référence mises à jour",
      description: "Les modifications ont été enregistrées avec succès",
    });
  };

  const getSourceBadge = (source: PhotoReference["source"]) => {
    const badges = {
      reference: { label: "Photo de référence", variant: "default" as const },
      voyageur: { label: "Photo voyageur", variant: "secondary" as const },
      agent: { label: "Photo agent", variant: "outline" as const },
      proprietaire: { label: "Photo propriétaire", variant: "outline" as const },
    };
    return badges[source];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{nomOperateur}</DialogTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Ouvrir le rapport IA
                </Button>
                <Button onClick={handleSave} className="gap-2 bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4" />
                  Terminé
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {isValidDate(dateDebut) && isValidDate(dateFin) && (
                <span>
                  Séjour du {new Date(dateDebut).toLocaleDateString("fr-FR")} au{" "}
                  {new Date(dateFin).toLocaleDateString("fr-FR")}
                </span>
              )}
              {telephone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {telephone}
                </span>
              )}
            </div>
          </DialogHeader>

          <Tabs defaultValue="check" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="check" className="flex-1">
                Check de sortie
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex-1">
                Questions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="check" className="space-y-4 mt-6">
              {pieces.map((piece) => (
                <Collapsible
                  key={piece.pieceId}
                  open={expandedPieces.includes(piece.pieceId)}
                  onOpenChange={() => togglePiece(piece.pieceId)}
                  className="border rounded-lg"
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{piece.pieceIcon}</span>
                        <span className="font-medium">{piece.pieceNom}</span>
                        {piece.statut && (
                          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                            {piece.statut}
                          </Badge>
                        )}
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-5 w-5 transition-transform",
                          expandedPieces.includes(piece.pieceId) && "rotate-180"
                        )}
                      />
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="p-4 pt-0 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Photo de référence</span>
                      <Button variant="link" className="text-primary h-auto p-0">
                        Votre photo
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {piece.photos.map((photo) => {
                        const isActive = photo.id === piece.photoReferenceActive;
                        const badge = getSourceBadge(photo.source);

                        return (
                          <div
                            key={photo.id}
                            className={cn(
                              "relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                              isActive
                                ? "border-primary ring-2 ring-primary/20"
                                : "border-transparent hover:border-muted-foreground/20"
                            )}
                            onClick={() => handlePhotoSelect(piece.pieceId, photo.id)}
                          >
                            <div className="aspect-video relative bg-muted">
                              <img
                                src={photo.url}
                                alt={`Photo ${piece.pieceNom}`}
                                className="w-full h-full object-cover"
                              />
                              {isActive && (
                                <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                                  <Check className="h-4 w-4" />
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                            <div className="p-2 space-y-2">
                              <div className="flex items-center justify-between">
                                <Badge variant={badge.variant} className="text-xs">
                                  {badge.label}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedPhoto(photo);
                                    }}>
                                      <ZoomIn className="h-4 w-4 mr-2" />
                                      Voir en grand
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handlePhotoDownload(photo);
                                    }}>
                                      <Download className="h-4 w-4 mr-2" />
                                      Télécharger
                                    </DropdownMenuItem>
                                    {!isActive && (
                                      <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        handlePhotoSelect(piece.pieceId, photo.id);
                                      }}>
                                        <Check className="h-4 w-4 mr-2" />
                                        Définir comme référence
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                      className="text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePhotoDelete(piece.pieceId, photo.id);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {isValidDate(photo.date) && (
                                <p className="text-xs text-muted-foreground">
                                  {formatDateLong(photo.date)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Button variant="outline" className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter une photo
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </TabsContent>

            <TabsContent value="questions" className="space-y-4 mt-6">
              <p className="text-muted-foreground text-center py-8">
                Fonctionnalité à venir
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Photo de référence</DialogTitle>
            </DialogHeader>
            <div className="relative w-full">
              <img
                src={selectedPhoto.url}
                alt="Photo en grand"
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <div className="mt-4 flex items-center justify-between">
                <div className="space-y-1">
                  <Badge variant={getSourceBadge(selectedPhoto.source).variant}>
                    {getSourceBadge(selectedPhoto.source).label}
                  </Badge>
                  {isValidDate(selectedPhoto.date) && (
                    <p className="text-sm text-muted-foreground">
                      📷 {formatDateLong(selectedPhoto.date)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handlePhotoDownload(selectedPhoto)}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
