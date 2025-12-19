import { Sparkles, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
interface Suggestion {
  titre: string;
  description: string;
  priorite: "haute" | "moyenne" | "basse";
}
interface RapportSuggestionsProps {
  suggestions: Suggestion[];
}
export default function RapportSuggestions({
  suggestions
}: RapportSuggestionsProps) {
  const getPrioriteIcon = (priorite: string) => {
    switch (priorite) {
      case "haute":
        return <AlertCircle className="h-5 w-5" />;
      case "moyenne":
        return <CheckCircle2 className="h-5 w-5" />;
      case "basse":
        return <Clock className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };
  const getPrioriteStyles = (priorite: string) => {
    return {
      card: "bg-background border border-border/50 hover:border-border",
      badge: "bg-muted/50 text-muted-foreground border border-border/50",
      icon: "text-muted-foreground"
    };
  };
  return <Card className="p-8 bg-card border shadow-sm">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">

      <h3 className="text-lg font-semibold text-foreground">Suggestions IA</h3>
    </div>

    <div className="space-y-2">
      {suggestions.map((suggestion, index) => {
        const styles = getPrioriteStyles(suggestion.priorite);
        return <div key={index} className={`p-3 rounded-lg transition-all duration-200 ${styles.card}`}>
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
              {getPrioriteIcon(suggestion.priorite)}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm mb-1 text-foreground whitespace-pre-wrap break-words">
                {suggestion.titre}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap break-words">
                {suggestion.description}
              </p>
            </div>

            <div className="flex-shrink-0">
              <span className={`text-xs px-2 py-1 rounded-md font-normal whitespace-nowrap ${styles.badge}`}>
                {suggestion.priorite === "haute" ? "Urgent" : suggestion.priorite === "moyenne" ? "Important" : "À prévoir"}
              </span>
            </div>
          </div>
        </div>;
      })}
    </div>

    {suggestions.length === 0 && <div className="text-center py-12">
      <div className="relative inline-block mb-4">
        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
        <Sparkles className="relative h-16 w-16 text-primary/40 mx-auto" />
      </div>
      <p className="text-foreground font-medium">Aucune suggestion pour le moment</p>
      <p className="text-sm text-muted-foreground mt-2">
        L&apos;IA analysera les prochains rapports pour vous proposer des améliorations
      </p>
    </div>}
  </Card>;
}