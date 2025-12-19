import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
interface CheckItem {
  id: string;
  text: string;
  completed: boolean;
  icon: string;
  photo?: string;
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
  return <Card className="p-8">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
        
        <h3 className="text-lg font-semibold text-foreground">Check final</h3>
      </div>
      
      <div className="space-y-3">
        {checkItems.map(item => <div key={item.id} className={`flex items-center gap-4 p-4 rounded-lg border ${item.completed ? "bg-background border-border" : "bg-muted/30 border-border"}`}>
            <div className={`flex-shrink-0 rounded-full p-1 ${item.completed ? "bg-green-50 text-green-600" : "bg-muted text-muted-foreground"}`}>
              <Check className="h-4 w-4" />
            </div>
            
            <div className="flex items-center gap-3 flex-1">
              <span className="text-xl flex-shrink-0">
                {getEmoji(item.icon)}
              </span>
              
              <p className={`font-medium text-sm ${item.completed ? "text-foreground" : "text-muted-foreground"}`}>
                {item.text}
              </p>
            </div>
            
            {item.photo && <div className="flex-shrink-0 w-20 h-16 bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity shadow-sm border border-border" onClick={() => onPhotoClick(item.photo!)}>
                <img src={item.photo} alt="Photo preuve" className="w-full h-full object-cover" />
              </div>}
          </div>)}
      </div>
      
      
    </Card>;
}