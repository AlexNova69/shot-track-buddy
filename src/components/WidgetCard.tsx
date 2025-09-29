import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface WidgetCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

export function WidgetCard({ icon: Icon, title, description, color, onClick }: WidgetCardProps) {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg active:scale-95" 
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <Icon className={`w-8 h-8 mx-auto mb-3 ${color}`} />
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}