import { Calendar, User, Phone, Mail, Star, Clock, Package, Wrench, Sparkles, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
interface RapportSyntheseProps {
  rapport: {
    logement: string;
    voyageur?: string; // Optionnel pour ménage
    email?: string; // Optionnel pour ménage
    telephone?: string; // Optionnel pour ménage
    dateDebut: string;
    dateFin: string;
    heureCheckin?: string; // Optionnel pour sortie uniquement
    heureCheckout: string;
    noteGenerale: number;
    sousNotes?: {
      presenceObjets: number;
      etatObjets: number;
      proprete: number;
      agencement: number;
    };
    statut: string;
    remarquesGenerales: {
      objetsManquants: string[];
      degradations: string[];
      propreteAgencement: string[];
      signalements: string[];
    };
    // Timestamps du parcours
    checkinStartHour?: string;
    checkinEndHour?: string;
    checkoutStartHour?: string;
    checkoutEndHour?: string;
  };
}
export default function RapportSynthese({
  rapport
}: RapportSyntheseProps) {
  const renderStars = (count: number) => {
    return <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => <Star key={i} className={`h-4 w-4 ${i < count ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />)}
        </div>
        <span className="font-semibold text-sm">{count}/5</span>
      </div>;
  };
  return <div className="space-y-6">
      {/* En-tête avec infos générales */}
      <Card className="p-6 bg-gradient-to-br from-background to-muted/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{rapport.logement}</h1>
            <p className="text-sm text-muted-foreground">Séjour du {rapport.dateDebut} au {rapport.dateFin}</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5">
            {rapport.statut}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations voyageur - Seulement si c'est un rapport voyageur */}
          {rapport.voyageur && (
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm mb-3 pb-2 border-b">
                <User className="h-4 w-4 text-primary" />
                Voyageur
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{rapport.voyageur}</span>
                </div>
                {rapport.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{rapport.email}</span>
                  </div>
                )}
                {rapport.telephone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span>{rapport.telephone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Check d'entrée - Afficher seulement si les données sont disponibles */}
          {(rapport.checkinStartHour || rapport.checkinEndHour) && (
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm mb-3 pb-2 border-b">
                <Clock className="h-4 w-4 text-primary" />
                Check d'entrée
              </h3>
              <div className="space-y-2">
                {rapport.checkinStartHour && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Début</span>
                    <span className="text-sm font-medium">{rapport.checkinStartHour}</span>
                  </div>
                )}
                {rapport.checkinEndHour && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Fin</span>
                    <span className="text-sm font-medium">{rapport.checkinEndHour}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Check de sortie - Afficher seulement si les données sont disponibles */}
          {(rapport.checkoutStartHour || rapport.checkoutEndHour) && (
            <div className="bg-background/80 backdrop-blur-sm rounded-lg p-4 border">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm mb-3 pb-2 border-b">
                <Clock className="h-4 w-4 text-primary" />
                Check de sortie
              </h3>
              <div className="space-y-2">
                {rapport.checkoutStartHour && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Début</span>
                    <span className="text-sm font-medium">{rapport.checkoutStartHour}</span>
                  </div>
                )}
                {rapport.checkoutEndHour && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Fin</span>
                    <span className="text-sm font-medium">{rapport.checkoutEndHour}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Note générale et sous-notes */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-6 text-lg text-center">Note Générale</h3>
        
        {/* Note générale principale */}
        <div className="flex flex-col items-center gap-2 mb-8 pb-6 border-b">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-8 w-8 ${i < rapport.noteGenerale ? "fill-primary text-primary" : "text-muted-foreground/30"}`} 
              />
            ))}
          </div>
          <span className="text-2xl font-bold">{rapport.noteGenerale}/5</span>
        </div>
        
        {rapport.sousNotes && <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/30 rounded-lg p-4 border">
              <div className="text-xs text-muted-foreground mb-2 text-center">Présence des objets</div>
              <div className="flex justify-center">
                {renderStars(rapport.sousNotes.presenceObjets)}
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border">
              <div className="text-xs text-muted-foreground mb-2 text-center">État des objets</div>
              <div className="flex justify-center">
                {renderStars(rapport.sousNotes.etatObjets)}
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border">
              <div className="text-xs text-muted-foreground mb-2 text-center">Propreté</div>
              <div className="flex justify-center">
                {renderStars(rapport.sousNotes.proprete)}
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 border">
              <div className="text-xs text-muted-foreground mb-2 text-center">Agencement</div>
              <div className="flex justify-center">
                {renderStars(rapport.sousNotes.agencement)}
              </div>
            </div>
          </div>}
      </Card>

      {/* Remarques générales */}
      
    </div>;
}