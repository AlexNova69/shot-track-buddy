import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, AlertTriangle } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function RecentRecords() {
  const [sideEffects] = useLocalStorage("sideEffects", []);

  const recentRecords = sideEffects
    .slice(-3)
    .reverse()
    .map((record: any) => ({
      date: new Date(record.date).toLocaleDateString("ru-RU"),
      time: new Date(record.date).toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' }),
      comment: record.description || "Без комментариев",
    }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-medical-warning" />
          Последние записи
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentRecords.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Нет записей о побочных эффектах
          </p>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((record, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-medical-warning mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span>{record.date}</span>
                    <span>•</span>
                    <span>{record.time}</span>
                  </div>
                  <p className="text-sm truncate">{record.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}