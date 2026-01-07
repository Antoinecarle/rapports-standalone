import { Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
interface CheckItem {
  id: string;
  text: string;
  completed: boolean;
  icon: string;
  photo?: string;
  responseText?: string;
}
interface RapportCheckFinalProps {
  checkItems: CheckItem[];
  onPhotoClick: (photo: string) => void;
}
export default function RapportCheckFinal({
  checkItems,
  onPhotoClick
}: RapportCheckFinalProps) {
  const getEmoji = (iconName: string) => {
    const emojiMap: Record<string, string> = {
      "key": "📍",
      "shield": "🛡️",
      "home": "🏠",
      "lightbulb": "💡",
      "trash": "🗑️",
      "lock": "🔐"
    };
    return emojiMap[iconName] || "✓";
  };
  return <Card className="p-4 md:p-6 lg:p-8">
    <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-border/50">

      <h3 className="text-base md:text-lg font-semibold text-foreground">Check final</h3>
    </div>

    <div className="space-y-2 md:space-y-3">
      {checkItems.map(item => <div key={item.id} className={`rounded-lg border ${item.completed ? "bg-background border-border" : "bg-red-50/50 border-red-200"}`}>
        <div className="flex items-center gap-2 md:gap-4 p-3 md:p-4">
          <div className={`flex-shrink-0 rounded-full p-1 ${item.completed ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {item.completed ? <Check className="h-3.5 md:h-4 w-3.5 md:w-4" /> : <X className="h-3.5 md:h-4 w-3.5 md:w-4" />}
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <span className="text-lg md:text-xl flex-shrink-0">
              {getEmoji(item.icon)}
            </span>

            <p className={`font-medium text-xs md:text-sm ${item.completed ? "text-foreground" : "text-red-700"} break-words`}>
              {item.text}
            </p>
          </div>

          {item.photo && <div className="flex-shrink-0 w-16 h-12 md:w-20 md:h-16 bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity shadow-sm border border-border" onClick={() => onPhotoClick(item.photo!)}>
            <img src={item.photo} alt="Photo preuve" className="w-full h-full object-cover" />
          </div>}
        </div>

        {/* Afficher le commentaire si présent */}
        {item.responseText && item.responseText.trim() !== '' && (
          <div className="px-3 md:px-4 pb-3 md:pb-4 pt-0">
            <div className="bg-muted/50 rounded-md p-2 md:p-3 border-l-2 border-primary/50">
              <p className="text-xs md:text-sm text-muted-foreground italic break-words">
                "{item.responseText}"
              </p>
            </div>
          </div>
        )}
      </div>)}
    </div>


  </Card>;
}