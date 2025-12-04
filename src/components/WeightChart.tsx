import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine, Brush 
} from "recharts";
import { TrendingDown, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/lib/translations";

type DateRange = "7d" | "30d" | "90d" | "all";

export function WeightChart() {
  const { language } = useLanguage();
  const t = translations[language];
  const locale = language === "ru" ? "ru-RU" : "en-US";
  
  const [weights] = useLocalStorage("weights", []);
  const [profile] = useLocalStorage("profile", { targetWeight: "" });
  const [dateRange, setDateRange] = useState<DateRange>("all");
  const [brushStartIndex, setBrushStartIndex] = useState<number | undefined>(undefined);
  const [brushEndIndex, setBrushEndIndex] = useState<number | undefined>(undefined);

  const allWeightData = useMemo(() => {
    return weights
      .map((entry: any) => ({
        date: new Date(entry.date).toLocaleDateString(locale, { month: "short", day: "numeric" }),
        weight: parseFloat(entry.weight),
        fullDate: new Date(entry.date),
        timestamp: new Date(entry.date).getTime(),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [weights, locale]);

  const filteredData = useMemo(() => {
    if (dateRange === "all") return allWeightData;
    
    const now = new Date();
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return allWeightData.filter(d => d.fullDate >= cutoff);
  }, [allWeightData, dateRange]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    const weights = filteredData.map(d => d.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const first = weights[0];
    const last = weights[weights.length - 1];
    const change = last - first;
    const target = parseFloat(profile.targetWeight) || 0;
    
    return { min, max, first, last, change, target };
  }, [filteredData, profile.targetWeight]);

  const yDomain = useMemo(() => {
    if (!stats) return ["auto", "auto"];
    const padding = (stats.max - stats.min) * 0.1 || 2;
    return [Math.floor(stats.min - padding), Math.ceil(stats.max + padding)];
  }, [stats]);

  const handleBrushChange = (brushData: any) => {
    if (brushData) {
      setBrushStartIndex(brushData.startIndex);
      setBrushEndIndex(brushData.endIndex);
    }
  };

  const resetZoom = () => {
    setBrushStartIndex(undefined);
    setBrushEndIndex(undefined);
  };

  const rangeLabels: Record<DateRange, string> = {
    "7d": language === "ru" ? "7 дней" : "7 days",
    "30d": language === "ru" ? "30 дней" : "30 days",
    "90d": language === "ru" ? "90 дней" : "90 days",
    "all": language === "ru" ? "Всё время" : "All time",
  };

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-medical-success" />
            {t.weightDynamicsWithTrend}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            {t.noWeightData}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-medical-success" />
            {t.weightDynamicsWithTrend}
          </CardTitle>
          
          <div className="flex items-center gap-2 flex-wrap">
            {(["7d", "30d", "90d", "all"] as DateRange[]).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setDateRange(range);
                  resetZoom();
                }}
                className="text-xs"
              >
                {rangeLabels[range]}
              </Button>
            ))}
            {(brushStartIndex !== undefined || brushEndIndex !== undefined) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetZoom}
                className="text-xs"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                {language === "ru" ? "Сброс" : "Reset"}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats summary */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-muted-foreground text-xs">{language === "ru" ? "Начальный" : "Start"}</p>
              <p className="font-bold text-lg">{stats.first.toFixed(1)}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <p className="text-muted-foreground text-xs">{language === "ru" ? "Текущий" : "Current"}</p>
              <p className="font-bold text-lg">{stats.last.toFixed(1)}</p>
            </div>
            <div className={`rounded-lg p-3 text-center ${stats.change <= 0 ? 'bg-medical-success/10' : 'bg-medical-warning/10'}`}>
              <p className="text-muted-foreground text-xs">{language === "ru" ? "Изменение" : "Change"}</p>
              <p className={`font-bold text-lg ${stats.change <= 0 ? 'text-medical-success' : 'text-medical-warning'}`}>
                {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}
              </p>
            </div>
            {stats.target > 0 && (
              <div className="bg-medical-info/10 rounded-lg p-3 text-center">
                <p className="text-muted-foreground text-xs">{language === "ru" ? "До цели" : "To goal"}</p>
                <p className="font-bold text-lg text-medical-info">
                  {Math.max(0, stats.last - stats.target).toFixed(1)}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Main chart */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart 
              data={filteredData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weightGradientEnhanced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--medical-success))" stopOpacity={0.4}/>
                  <stop offset="50%" stopColor="hsl(var(--medical-success))" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="hsl(var(--medical-success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))"
                opacity={0.5}
              />
              <XAxis 
                dataKey="date" 
                fontSize={11}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={yDomain}
                fontSize={11}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(value) => `${value}`}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
                formatter={(value: any) => [
                  `${value.toFixed(1)} ${language === "ru" ? "кг" : "kg"}`, 
                  language === "ru" ? "Вес" : "Weight"
                ]}
                labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
              />
              
              {/* Target weight line */}
              {stats && stats.target > 0 && (
                <ReferenceLine 
                  y={stats.target} 
                  stroke="hsl(var(--medical-info))" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  label={{ 
                    value: `${language === "ru" ? "Цель" : "Goal"}: ${stats.target}`,
                    fill: 'hsl(var(--medical-info))',
                    fontSize: 11,
                    position: 'right'
                  }}
                />
              )}
              
              <Area
                type="monotone"
                dataKey="weight"
                stroke="hsl(var(--medical-success))"
                strokeWidth={2.5}
                fill="url(#weightGradientEnhanced)"
                dot={{ 
                  fill: 'hsl(var(--medical-success))', 
                  strokeWidth: 2,
                  stroke: 'hsl(var(--background))',
                  r: filteredData.length <= 30 ? 4 : 0
                }}
                activeDot={{ 
                  r: 6, 
                  fill: 'hsl(var(--medical-success))',
                  stroke: 'hsl(var(--background))',
                  strokeWidth: 2
                }}
              />
              
              {/* Brush for zooming */}
              <Brush 
                dataKey="date" 
                height={40} 
                stroke="hsl(var(--medical-primary))"
                fill="hsl(var(--muted))"
                startIndex={brushStartIndex}
                endIndex={brushEndIndex}
                onChange={handleBrushChange}
                tickFormatter={() => ''}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Zoom hint */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            <ZoomIn className="w-3 h-3" />
            {language === "ru" ? "Используйте ползунок для масштабирования" : "Use slider to zoom"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
