import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { TrendingDown, Syringe, Activity, Target, MapPin, Calendar } from "lucide-react";

export default function Charts() {
  const [weights] = useLocalStorage("weights", []);
  const [injections] = useLocalStorage("injections", []);
  const [sideEffects] = useLocalStorage("sideEffects", []);
  const [profile] = useLocalStorage("profile", { targetWeight: "" });

  const weightData = weights
    .map((entry: any) => ({
      date: new Date(entry.date).toLocaleDateString("ru-RU", { month: "short", day: "numeric" }),
      weight: parseFloat(entry.weight),
      fullDate: new Date(entry.date),
    }))
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

  // Calculate weight progress
  const weightProgress = weightData.length > 1 ? {
    initial: weightData[0].weight,
    current: weightData[weightData.length - 1].weight,
    target: parseFloat(profile.targetWeight) || 0,
    lost: weightData[0].weight - weightData[weightData.length - 1].weight,
  } : null;

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

  // Injection sites analysis
  const siteData = injections.reduce((acc: any[], curr: any) => {
    const existing = acc.find(item => item.site === curr.site);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ site: curr.site, count: 1 });
    }
    return acc;
  }, []);

  // Side effects frequency
  const sideEffectsData = sideEffects.reduce((acc: any[], curr: any) => {
    const month = new Date(curr.date).toLocaleDateString("ru-RU", { month: "short" });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ month, count: 1 });
    }
    return acc;
  }, []);

  // Enhanced weight data with trend
  const enhancedWeightData = weightData.map((entry, index) => {
    const trend = index > 0 ? entry.weight - weightData[index - 1].weight : 0;
    return { ...entry, trend };
  });

  const COLORS = ['#0066cc', '#00b894', '#fdcb6e', '#e17055', '#a29bfe'];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6">Графики и аналитика</h2>
      
      {/* Progress Cards */}
      {weightProgress && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Потеряно</p>
                  <p className="text-2xl font-bold text-medical-success">{weightProgress.lost.toFixed(1)} кг</p>
                </div>
                <TrendingDown className="w-8 h-8 text-medical-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Текущий</p>
                  <p className="text-2xl font-bold">{weightProgress.current} кг</p>
                </div>
                <Activity className="w-8 h-8 text-medical-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Цель</p>
                  <p className="text-2xl font-bold text-medical-info">{weightProgress.target} кг</p>
                </div>
                <Target className="w-8 h-8 text-medical-info" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Осталось</p>
                  <p className="text-2xl font-bold text-medical-warning">
                    {Math.max(0, weightProgress.current - weightProgress.target).toFixed(1)} кг
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-medical-warning" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="weight" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="weight" className="flex items-center gap-1">
            <TrendingDown className="w-4 h-4" />
            <span className="hidden sm:inline">Вес</span>
          </TabsTrigger>
          <TabsTrigger value="injections" className="flex items-center gap-1">
            <Syringe className="w-4 h-4" />
            <span className="hidden sm:inline">Инъекции</span>
          </TabsTrigger>
          <TabsTrigger value="dose" className="flex items-center gap-1">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Дозы</span>
          </TabsTrigger>
          <TabsTrigger value="sites" className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Места</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Анализ</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-medical-success" />
                Динамика веса с трендом
              </CardTitle>
            </CardHeader>
            <CardContent>
              {enhancedWeightData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={enhancedWeightData}>
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--medical-success))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--medical-success))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
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
                      formatter={(value: any, name: string) => [
                        `${value} кг`, 
                        name === 'weight' ? 'Вес' : 'Изменение'
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="hsl(var(--medical-success))"
                      strokeWidth={2}
                      fill="url(#weightGradient)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="trend" 
                      stroke="hsl(var(--medical-warning))" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={{ fill: 'hsl(var(--medical-warning))', strokeWidth: 1, r: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">
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

        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-medical-primary" />
                Использование мест инъекций
              </CardTitle>
            </CardHeader>
            <CardContent>
              {siteData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={siteData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {siteData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {siteData.map((site, index) => (
                      <div key={site.site} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-sm">{site.site}</span>
                        </div>
                        <span className="font-medium">{site.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  Нет данных о местах инъекций
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Побочные эффекты по месяцам</CardTitle>
              </CardHeader>
              <CardContent>
                {sideEffectsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={sideEffectsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--medical-warning))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    Нет данных о побочных эффектах
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Статистика</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-medical-primary/10 rounded">
                    <p className="text-2xl font-bold text-medical-primary">{injections.length}</p>
                    <p className="text-sm text-muted-foreground">Всего инъекций</p>
                  </div>
                  <div className="text-center p-3 bg-medical-success/10 rounded">
                    <p className="text-2xl font-bold text-medical-success">{weights.length}</p>
                    <p className="text-sm text-muted-foreground">Записей веса</p>
                  </div>
                  <div className="text-center p-3 bg-medical-warning/10 rounded">
                    <p className="text-2xl font-bold text-medical-warning">{sideEffects.length}</p>
                    <p className="text-sm text-muted-foreground">Побочных эффектов</p>
                  </div>
                  <div className="text-center p-3 bg-medical-info/10 rounded">
                    <p className="text-2xl font-bold text-medical-info">
                      {injections.length > 0 ? Math.round(injections.reduce((sum, inj) => sum + parseFloat(inj.dose), 0) * 10) / 10 : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Общая доза</p>
                  </div>
                </div>
                
                {weightProgress && (
                  <div className="mt-4 p-3 bg-gradient-to-r from-medical-success/10 to-medical-info/10 rounded">
                    <h4 className="font-medium mb-2">Прогресс снижения веса</h4>
                    <div className="w-full bg-background rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-medical-success to-medical-info h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${Math.min(100, Math.max(0, (weightProgress.lost / (weightProgress.initial - weightProgress.target)) * 100))}%` 
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {weightProgress.lost > 0 
                        ? `Потеряно ${weightProgress.lost.toFixed(1)} кг из ${(weightProgress.initial - weightProgress.target).toFixed(1)} кг цели`
                        : 'Начните записывать вес для отслеживания прогресса'
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}