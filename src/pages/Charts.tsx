import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TrendingDown, Syringe, Activity } from "lucide-react";

export default function Charts() {
  const [weights] = useLocalStorage("weights", []);
  const [injections] = useLocalStorage("injections", []);

  const weightData = weights
    .map((entry: any) => ({
      date: new Date(entry.date).toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
      weight: parseFloat(entry.weight),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const injectionData = injections
    .reduce((acc: any[], curr: any) => {
      const date = new Date(curr.date).toLocaleDateString("ru-RU", { month: "short", day: "numeric" });
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.count += 1;
        existing.totalDose += parseFloat(curr.dose);
      } else {
        acc.push({
          date,
          count: 1,
          totalDose: parseFloat(curr.dose),
        });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const doseData = injections
    .map((entry: any) => ({
      date: new Date(entry.date).toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
      dose: parseFloat(entry.dose),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Графики и аналитика</h2>
      
      <Tabs defaultValue="weight" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weight" className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Вес
          </TabsTrigger>
          <TabsTrigger value="injections" className="flex items-center gap-2">
            <Syringe className="w-4 h-4" />
            Инъекции
          </TabsTrigger>
          <TabsTrigger value="dose" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Дозировка
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-medical-success" />
                Динамика веса
              </CardTitle>
            </CardHeader>
            <CardContent>
              {weightData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="hsl(var(--medical-success))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--medical-success))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Нет данных о весе
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="injections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-medical-primary" />
                Количество инъекций
              </CardTitle>
            </CardHeader>
            <CardContent>
              {injectionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={injectionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="hsl(var(--medical-primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Нет данных об инъекциях
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-medical-info" />
                Динамика дозировки
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doseData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={doseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      fontSize={12}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      fontSize={12}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="dose" 
                      stroke="hsl(var(--medical-info))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--medical-info))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Нет данных о дозировке
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}