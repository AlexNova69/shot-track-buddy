import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function MiniChart() {
  const [weights] = useLocalStorage("weights", []);

  const data = weights
    .slice(-7) // Last 7 entries
    .map((entry: any) => ({
      weight: parseFloat(entry.weight),
      date: new Date(entry.date).getDate(),
    }));

  if (data.length === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data}>
        <XAxis 
          dataKey="date" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis hide />
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="hsl(var(--medical-success))" 
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}